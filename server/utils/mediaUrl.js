const isAbsolute = (value) => /^(https?:)?\/\//i.test(value || '') || (value || '').startsWith('data:');

const stripTrailingSlash = (value = '') => value.endsWith('/') ? value.slice(0, -1) : value;
const ensureLeadingSlash = (value = '') => value.startsWith('/') ? value : `/${value}`;

const resolveBaseFromEnv = () => {
  const raw = (process.env.MEDIA_BASE_URL || process.env.PUBLIC_BASE_URL || '').trim();
  console.log("qqqqqq: "+raw);
  console.log("qqqqqq: "+ (raw ? stripTrailingSlash(raw) : ''));
  
  return raw ? stripTrailingSlash(raw) : '';
};

export const prepareMediaPathForStorage = (value) => {
  if (!value) return null;
  if (isAbsolute(value)) {
    const idx = value.indexOf('/uploads/');
    if (idx >= 0) return value.slice(idx);
    return value.trim();
  }
  return ensureLeadingSlash(value.trim());
};

export const buildPublicMediaUrl = (path, req) => {
  if (!path) return null;
  const normalized = ensureLeadingSlash(path);
  const envBase = resolveBaseFromEnv();
  if (envBase) {
    return `${envBase}${normalized}`;
  }
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const forwardedHost = req?.headers?.['x-forwarded-host'];
  const host = forwardedHost || req?.get?.('host');
  const protocol = forwardedProto || req?.protocol || 'http';
  if (host) {
    return `${protocol}://${host}${normalized}`;
  }
  return normalized;
};

export const canonicalizeMediaUrl = (value, req) => {
  if (!value) return null;
  if (isAbsolute(value)) return value.trim();
  return buildPublicMediaUrl(value, req);
};
