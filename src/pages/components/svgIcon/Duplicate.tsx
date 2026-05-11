import { SvgIconProps } from './interface';

const Duplicate = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      role="img"
      aria-label="duplicate"
      focusable="false"
      data-icon="duplicate"
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
        d="M19 14.5H16.5V16H19C20.1046 16 21 15.1046 21 14V4C21 2.89543 20.1046 2 19 2H11C9.89543 2 9 2.89543 9 4V5.5H10.5V4C10.5 3.72386 10.7239 3.5 11 3.5H19C19.2761 3.5 19.5 3.72386 19.5 4V14C19.5 14.2761 19.2761 14.5 19 14.5ZM4.5 19C4.5 19.2761 4.72386 19.5 5 19.5H13C13.2761 19.5 13.5 19.2761 13.5 19V9C13.5 8.72386 13.2761 8.5 13 8.5H5C4.72386 8.5 4.5 8.72386 4.5 9V19ZM5 7C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H13C14.1046 21 15 20.1046 15 19V9C15 7.89543 14.1046 7 13 7H5ZM6 14.749H8.25V16.999H9.75V14.749H12V13.249H9.75V10.999H8.25V13.249H6V14.749Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};

export default Duplicate;
