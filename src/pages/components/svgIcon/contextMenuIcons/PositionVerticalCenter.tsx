import { SvgIconProps } from '../interface';

const PositionVerticalCenter = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <svg
      {...other}
      width={width || size || '24'}
      height={height || size || '24'}
      role="img"
      aria-label="position-vertical-center"
      focusable="false"
      data-icon="position-vertical-center"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 8.96074L15.4687 6.18372L14.5312 5.01276L12.75 6.43882V2H11.25V6.43882L9.46871 5.01276L8.53125 6.18372L12 8.96074ZM9.46871 18.9872L8.53125 17.8163L12 15.0393L15.4687 17.8163L14.5312 18.9872L12.75 17.5612V22H11.25V17.5612L9.46871 18.9872ZM20 12.75H4V11.25H20V12.75Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};
export default PositionVerticalCenter;
