import { SvgIconProps } from '../interface';

const Paste = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      role="img"
      aria-label="paste"
      focusable="false"
      data-icon="paste"
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
        d="M21 14.5C21 15.6046 20.1046 16.5 19 16.5H18H17.6477V15.75V15H18H19C19.2761 15 19.5 14.7761 19.5 14.5V14V12.9091H20.25H21V14V14.5ZM19 2.5C20.1046 2.5 21 3.39543 21 4.5V5V6.09091H20.25H19.5V5V4.5C19.5 4.22386 19.2761 4 19 4H18H17.6477V3.25V2.5H18H19ZM12 2.5H11.8523H10.5C9.39543 2.5 8.5 3.39543 8.5 4.5V5V6.09091H9.25H10V5V4.5C10 4.22386 10.2239 4 10.5 4H11.8523H12V2.5ZM20.25 7.90909H21V11.0909H20.25H19.5V7.90909H20.25ZM13.3977 3.25V2.5H16.1023V3.25V4H13.3977V3.25ZM14 19.5C14 19.7761 13.7761 20 13.5 20H5C4.72386 20 4.5 19.7761 4.5 19.5V9.5C4.5 9.22386 4.72386 9 5 9H13.5C13.7761 9 14 9.22386 14 9.5V19.5ZM3 9.5C3 8.39543 3.89543 7.5 5 7.5H13.5C14.6046 7.5 15.5 8.39543 15.5 9.5V19.5C15.5 20.6046 14.6046 21.5 13.5 21.5H5C3.89543 21.5 3 20.6046 3 19.5V9.5Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};
export default Paste;
