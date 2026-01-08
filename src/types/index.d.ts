// Fixes TS2694
declare global {
    namespace React {
      /** Fixes React 18 compatibility issues with formik: https://github.com/jaredpalmer/formik/issues/3546#issuecomment-1127014775 */
      type StatelessComponent<P> = React.FunctionComponent<P>;
    }
  }

declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';
  
  // Fixes TS2669
  export { };
