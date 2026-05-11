import { SvgIconProps } from '../interface';

const Overlap = (props: SvgIconProps) => {
  const { size, width, height, color, ...other } = props;
  return (
    <>
      <svg
        {...other}
        width={width || size || '24'}
        height={height || size || '24'}
        role="img"
        aria-label="overlap"
        focusable="false"
        data-icon="overlap"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 4.5H13.5C13.7761 4.5 14 4.72386 14 5V8.61551C11.2744 9.12587 9.12587 11.2744 8.61551 14H5C4.72386 14 4.5 13.7761 4.5 13.5V5C4.5 4.72386 4.72386 4.5 5 4.5ZM8.50454 15.5H5C3.89543 15.5 3 14.6046 3 13.5V5C3 3.89543 3.89543 3 5 3H13.5C14.6046 3 15.5 3.89543 15.5 5V8.50454C19.1121 8.63606 22 11.6058 22 15.25C22 18.9779 18.9779 22 15.25 22C11.6058 22 8.63606 19.1121 8.50454 15.5ZM15.5 10.0058C18.2834 10.1363 20.5 12.4343 20.5 15.25C20.5 18.1495 18.1495 20.5 15.25 20.5C12.4343 20.5 10.1363 18.2834 10.0058 15.5H13.5C14.6046 15.5 15.5 14.6046 15.5 13.5V10.0058ZM14 10.1497V13.5C14 13.7761 13.7761 14 13.5 14H10.1497C10.6127 12.1046 12.1046 10.6127 14 10.1497Z"
          fill={color || '#333'}
        ></path>
      </svg>
    </>
  );
};
export default Overlap;
