import { SvgIconProps } from './interface';

const LetterSpace = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <>
      <svg
        {...other}
        role="img"
        aria-label="letter-space"
        focusable="false"
        data-icon="letter-space"
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
          d="M2.75 20V4H4.25L4.25 20H2.75ZM19.75 20V4H21.25V20H19.75ZM11.4143 6L6.40527 18H7.99959L9.61474 14.25H14.5262L15.9998 18H17.5804L13.0017 6H11.4143ZM13.9368 12.75L12.1831 8.28688L10.2608 12.75H13.9368Z"
          fill={color || '#333'}
        ></path>
      </svg>
    </>
  );
};

export default LetterSpace;
