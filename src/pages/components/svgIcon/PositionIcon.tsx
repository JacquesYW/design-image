import { SvgIconProps } from './interface';
export type DirectionType = 'top' | 'bottom' | 'left' | 'right';
const PositionIcon = (props: SvgIconProps & { direction: DirectionType }) => {
  const { direction, size, width, height, color, ...other } = props;
  return (
    <>
      {direction == 'left' ? (
        <svg
          {...other}
          role="img"
          aria-label="position-left"
          focusable="false"
          data-icon="position-left"
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
            d="M5.93934 12L10.9697 17.0303L12.0303 15.9696L8.81066 12.75L21 12.75L21 11.25L8.81067 11.25L12.0303 8.03035L10.9697 6.96969L5.93934 12ZM4.5 20L4.5 4.00003L3 4.00003L3 20L4.5 20Z"
            fill={color || '#333'}
          ></path>
        </svg>
      ) : null}
      {direction == 'right' ? (
        <svg
          {...other}
          role="img"
          aria-label="position-right"
          focusable="false"
          data-icon="position-right"
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
            d="M18.0607 12.0001L13.0303 6.96973L11.9697 8.03039L15.1893 11.2501L3 11.2501L3 12.7501L15.1893 12.7501L11.9697 15.9697L13.0303 17.0303L18.0607 12.0001ZM19.5 4L19.5 20L21 20L21 4L19.5 4Z"
            fill={color || '#333'}
          ></path>
        </svg>
      ) : null}
      {direction == 'top' ? (
        <svg
          {...other}
          role="img"
          aria-label="position-top"
          focusable="false"
          data-icon="position-top"
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
            d="M11.9999 5.93934L17.0303 10.9697L15.9696 12.0303L12.7499 8.81066V21H11.2499V8.81067L8.03032 12.0303L6.96966 10.9697L11.9999 5.93934ZM20 4.5H4V3H20V4.5Z"
            fill={color || '#333'}
          ></path>
        </svg>
      ) : null}
      {direction == 'bottom' ? (
        <svg
          {...other}
          role="img"
          aria-label="position-bottom"
          focusable="false"
          data-icon="position-bottom"
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
            d="M11.9999 18.0607L17.0303 13.0303L15.9696 11.9697L12.7499 15.1893V3H11.2499V15.1893L8.03032 11.9697L6.96966 13.0303L11.9999 18.0607ZM20 19.5H4V21H20V19.5Z"
            fill={color || '#333'}
          ></path>
        </svg>
      ) : null}
    </>
  );
};
export default PositionIcon;
