import { InterpolationWithTheme } from '@emotion/core'

declare module 'rebass' {
  interface FlexProps {
    css?: InterpolationWithTheme<any>
  }

  interface BoxProps {
    css?: InterpolationWithTheme<any>
  }

  // Add other interface extensions here for rebass.
  // See: https://github.com/rebassjs/rebass/issues/755#issuecomment-587250893
}

declare module '@rebass/forms' {
  interface InputProps {
    css?: InterpolationWithTheme<any>
  }

  interface Switch
    extends BoxKnownProps,
      Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof BoxKnownProps> {
    checked: boolean
  }

  export const Switch: React.ComponentType<SliderProps>

  // Add other interface extensions here for rebass forms.
  // See: https://github.com/rebassjs/rebass/issues/755#issuecomment-587250893
}

declare module 'react' {
  interface DOMAttributes<T> {
    css?: InterpolationWithTheme<any>
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: InterpolationWithTheme<any>
    }
  }
}
