/* eslint-disable @typescript-eslint/consistent-type-definitions */

// declare module 'cssstyle' {
//   export class CSSStyleDeclaration {
//     [index: number]: string;
//     length: number;
//     setProperty(property: string, value: string): void;
//     getPropertyValue(property: string): string;
//     // Add other methods and properties as needed
//   }
// };

declare module 'saxon-js' {
  const saxonJS: {
    transform: (...args: any[]) => any;  // (Optionally, you can expand as you learn the API)
    [key: string]: any;
  };
  export default saxonJS;
}

export {};

declare global {
  interface Window {
    exampleRaw?: string;
  }

  const __DEV__: boolean;
}
