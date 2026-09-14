/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
type JSX = {
  props: Record<string, unknown>;
  elementType: string;
};

declare module "*.css" {
  const classes: { [className: string]: string };
  export default classes;
}
