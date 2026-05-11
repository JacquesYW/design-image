import { SvgIconProps } from './interface';

const Unlock = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      role="img"
      aria-label="unlock"
      focusable="false"
      data-icon="unlock"
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
        d="M16 9V7.5C16 5.29086 14.2091 3.5 12 3.5C10.6191 3.5 9.40163 4.19975 8.68284 5.264L7.17401 4.85971C8.10839 3.15544 9.91926 2 12 2C15.0376 2 17.5 4.46243 17.5 7.5V9H18C19.1046 9 20 9.89543 20 11V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V11C4 9.89543 4.89543 9 6 9H6.5H8H11.0001H16ZM16 10.5H17.5H18C18.2761 10.5 18.5 10.7239 18.5 11V19C18.5 19.2761 18.2761 19.5 18 19.5H6C5.72386 19.5 5.5 19.2761 5.5 19V11C5.5 10.7239 5.72386 10.5 6 10.5H6.5H8H16Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};

export default Unlock;
