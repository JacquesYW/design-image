import { SvgIconProps } from '../interface';

const Copy = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      width={width || size || '24'}
      height={height || size || '24'}
      role="img"
      aria-label="copy"
      focusable="false"
      data-icon="copy"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 15H16.5V16.5H19C20.1046 16.5 21 15.6046 21 14.5V4.5C21 3.39543 20.1046 2.5 19 2.5H10.5C9.39543 2.5 8.5 3.39543 8.5 4.5V6.5H10V4.5C10 4.22386 10.2239 4 10.5 4H19C19.2761 4 19.5 4.22386 19.5 4.5V14.5C19.5 14.7761 19.2761 15 19 15Z"
        fill={color || '#333'}
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 9.5C3 8.39543 3.89543 7.5 5 7.5H13.5C14.6046 7.5 15.5 8.39543 15.5 9.5V19.5C15.5 20.6046 14.6046 21.5 13.5 21.5H5C3.89543 21.5 3 20.6046 3 19.5V9.5ZM13.5 20H5C4.72386 20 4.5 19.7761 4.5 19.5V9.5C4.5 9.22386 4.72386 9 5 9H13.5C13.7761 9 14 9.22386 14 9.5V19.5C14 19.7761 13.7761 20 13.5 20Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};
export default Copy;
