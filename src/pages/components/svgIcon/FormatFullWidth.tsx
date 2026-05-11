import { SvgIconProps } from './interface';

const FormatFullWidth = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      role="img"
      aria-label="format-full-width"
      focusable="false"
      data-icon="format-full-width"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      width={width || size || '24'}
      height={height || size || '24'}
    >
      <path d="M0 0H24V2H0V0Z" fill={color || '#333'}></path>
      <path d="M0 6.5H24V8.5H0V6.5Z" fill={color || '#333'}></path>
      <path d="M0 13H24V15H0V13Z" fill={color || '#333'}></path>
      <path d="M0 19.5H24V21.5H0V19.5Z" fill={color || '#333'}></path>
    </svg>
  );
};

export default FormatFullWidth;
