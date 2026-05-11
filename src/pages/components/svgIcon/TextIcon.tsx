import { SvgIconProps } from './interface';

const TextIcon = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      role="img"
      aria-label="text"
      focusable="false"
      data-icon="text"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width || size || '24'}
      height={height || size || '24'}
    >
      <path
        d="M4 4V7.11H5.5V4.5H11.3501V19.5H8.49998V21H15.5V19.5H12.8501V4.5H18.5V7.11H20L20 4C20 3.44772 19.5523 3 19 3H5C4.44772 3 4 3.44772 4 4Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};

export default TextIcon;
