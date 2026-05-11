import { SvgIconProps } from './interface';

const AlignMultipleIcon = (
  props: SvgIconProps & {
    direction:
      | 'horizontalLeft'
      | 'horizontalCenter'
      | 'horizontalRight'
      | 'verticalTop'
      | 'verticalCenter'
      | 'verticalBottom';
  },
) => {
  const { size, width, height, color, direction, ...other } = props;
  return (
    <>
      {direction === 'horizontalLeft' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-vertical-left-multiple"
          focusable="false"
          data-icon="align-vertical-left-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.75 10H21.75V8H8.75V10ZM8.75 16H15.75V14H8.75V16Z"
            fill={color || '#222529'}
          ></path>
          <path fillRule="evenodd" clipRule="evenodd" d="M4 21L4 3L5.5 3L5.5 21L4 21Z" fill={color || '#B4B8BF'}></path>
        </svg>
      ) : null}
      {direction === 'horizontalCenter' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-vertical-center-multiple"
          focusable="false"
          data-icon="align-vertical-center-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.25 21L11.25 3L12.75 3L12.75 21L11.25 21Z"
            fill={color || '#B4B8BF'}
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.5 10H18.5V8H5.5V10ZM8.5 16H15.5V14H8.5V16Z"
            fill={color || '#222529'}
          ></path>
        </svg>
      ) : null}
      {direction === 'horizontalRight' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-vertical-right-multiple"
          focusable="false"
          data-icon="align-vertical-right-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17 10H4V8H17V10ZM17 16H10V14H17V16Z"
            fill={color || '#222529'}
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.75 21L21.75 3L20.25 3L20.25 21L21.75 21Z"
            fill={color || '#B4B8BF'}
          ></path>
        </svg>
      ) : null}
      {direction === 'verticalTop' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-horizontal-top-multiple"
          focusable="false"
          data-icon="align-horizontal-top-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5 7.5L10.5 20.5L8.5 20.5L8.5 7.5L10.5 7.5ZM16.5 7.5L16.5 14.5L14.5 14.5L14.5 7.5L16.5 7.5Z"
            fill={color || '#222529'}
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.5 2.75L3.5 2.75L3.5 4.25L21.5 4.25L21.5 2.75Z"
            fill={color || '#B4B8BF'}
          ></path>
        </svg>
      ) : null}
      {direction === 'verticalCenter' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-horizontal-middle-multiple"
          focusable="false"
          data-icon="align-horizontal-middle-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 11.25L3 11.25L3 12.75L21 12.75L21 11.25Z"
            fill={color || '#B4B8BF'}
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 5.5L10 18.5H8V5.5H10ZM16 8.5V15.5H14L14 8.5H16Z"
            fill={color || '#222529'}
          ></path>
        </svg>
      ) : null}
      {direction === 'verticalBottom' ? (
        <svg
          {...other}
          role="img"
          aria-label="align-horizontal-bottom-multiple"
          focusable="false"
          data-icon="align-horizontal-bottom-multiple"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={width || size || '24'}
          height={height || size || '24'}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5 16.5L10.5 3.5L8.5 3.5L8.5 16.5L10.5 16.5ZM16.5 16.5L16.5 9.5L14.5 9.5L14.5 16.5L16.5 16.5Z"
            fill={color || '#222529'}
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.5 21.25L3.5 21.25L3.5 19.75L21.5 19.75L21.5 21.25Z"
            fill={color || '#B4B8BF'}
          ></path>
        </svg>
      ) : null}
    </>
  );
};

export default AlignMultipleIcon;
