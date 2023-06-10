// Forked cloudinary transformer
// As of 10. June 2023 the original transformer does not support fetch delivery type
import type {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlTransformer,
} from "unpic";

export const roundIfNumeric = (value: string | number) => {
  if (!value) {
    return value;
  }
  const num = Number(value);
  return isNaN(num) ? value : Math.round(num);
};

// Julian: Here is the only change from the original transformer
// For simplicity I just removed the format from the regex
const cloudinaryRegex =
  /https?:\/\/(?<host>[^\/]+)\/(?<cloudName>[^\/]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>[^\s]+)$/g;
///https?:\/\/(?<host>[^\/]+)\/(?<cloudName>[^\/]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>[^\.^\s]+)\.?(?<format>[a-zA-Z]+$)?$/g;

const parseTransforms = (transformations: string) => {
  return transformations
    ? Object.fromEntries(transformations.split(",").map((t) => t.split("_")))
    : {};
};

const formatUrl = ({
  host,
  cloudName,
  assetType,
  deliveryType,
  signature,
  transformations = {},
  version,
  id,
  format,
}: CloudinaryParams): string => {
  if (format) {
    transformations.f = format;
  }
  const transformString = Object.entries(transformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  const pathSegments = [
    host,
    cloudName,
    assetType,
    deliveryType,
    signature,
    transformString,
    version,
    id,
  ]
    .filter(Boolean)
    .join("/");
  return `https://${pathSegments}`;
};

export interface CloudinaryParams {
  host?: string;
  cloudName?: string;
  assetType?: string;
  deliveryType?: string;
  signature?: string;
  transformations: Record<string, string>;
  version?: string;
  id?: string;
  format?: string;
}
export const parse: UrlParser<CloudinaryParams> = (imageUrl) => {
  const url = new URL(imageUrl);
  const matches = [...url.toString().matchAll(cloudinaryRegex)];
  if (!matches.length) {
    throw new Error("Invalid Cloudinary URL");
  }

  const group = matches[0].groups || {};
  const {
    transformations: transformString = "",
    format: originalFormat,
    ...baseParams
  } = group;

  const { w, h, f, ...transformations } = parseTransforms(transformString);

  const format = f && f !== "auto" ? f : originalFormat;

  const base = formatUrl({ ...baseParams, transformations });
  return {
    base,
    width: Number(w) || undefined,
    height: Number(h) || undefined,
    format,
    cdn: "cloudinary",
    params: { ...group, transformations },
  };
};

export const generate: UrlGenerator<CloudinaryParams> = ({
  base,
  width,
  height,
  format,
  params,
}) => {
  const parsed = parse(base.toString());

  const props: CloudinaryParams = {
    transformations: {},
    ...parsed.params,
    ...params,
    format: format || "auto",
  };
  if (width) {
    props.transformations.w = roundIfNumeric(width).toString();
  }
  if (height) {
    props.transformations.h = roundIfNumeric(height).toString();
  }

  // Default crop to fill without upscaling
  props.transformations.c ||= "lfill";
  return formatUrl(props);
};

export const transform: UrlTransformer = ({
  url: originalUrl,
  width,
  height,
  format = "auto",
}) => {
  const parsed = parse(originalUrl);
  if (!parsed) {
    throw new Error("Invalid Cloudinary URL");
  }

  if (parsed.params?.assetType !== "image") {
    throw new Error("Cloudinary transformer only supports images");
  }

  if (parsed.params?.signature) {
    throw new Error("Cloudinary transformer does not support signed URLs");
  }

  const props: UrlGeneratorOptions<CloudinaryParams> = {
    ...parsed,
    width,
    height,
    format,
  };

  return generate(props);
};
