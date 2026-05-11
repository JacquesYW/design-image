import { SvgIconProps } from './interface';
export type ActionType = 'up' | 'down';
const SequenceIcon = (props: SvgIconProps & { action: ActionType }) => {
  const { size, width, height, color, action, ...other } = props;
  return action == 'down' ? (
    <svg
      {...other}
      role="img"
      aria-label="layerdown"
      focusable="false"
      data-icon="layerdown"
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
        d="M19.8677 8.50004L12.7192 4.60048C12.2715 4.35626 11.7303 4.35624 11.2826 4.60042L4.13269 8.49999L9.0009 11.1552V12.8638L2.93156 9.55348C2.09768 9.09867 2.09768 7.90129 2.93157 7.44649L10.5644 3.28355C11.4598 2.79517 12.5421 2.79522 13.4375 3.28366L21.0688 7.44658C21.9026 7.90142 21.9026 9.09866 21.0688 9.55349L15.0009 12.8636V11.1549L19.8677 8.50004ZM12.5149 20.5455L16.5149 16.7713L15.4854 15.6803L12.7501 18.2612L12.7501 8.50004H11.2501L11.2501 18.2612L8.51485 15.6803L7.48544 16.7713L11.4854 20.5455L12.0001 21.0312L12.5149 20.5455Z"
        fill={color || '#333'}
      ></path>
    </svg>
  ) : (
    <svg
      {...other}
      role="img"
      aria-label="layerup"
      focusable="false"
      data-icon="layerup"
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
        d="M11.4849 3.45465L7.4849 7.22884L8.51432 8.31985L11.2496 5.73897V15.5002H12.7496V5.73897L15.4849 8.31985L16.5143 7.22884L12.5143 3.45465L11.9996 2.96899L11.4849 3.45465ZM2.93095 14.4464L9.00004 11.1352V12.844L4.13216 15.4997L11.2815 19.3986C11.7292 19.6427 12.2702 19.6427 12.7178 19.3986L19.8676 15.4997L15 12.8442V11.1356L21.0688 14.4463C21.9026 14.9012 21.9025 16.0985 21.0686 16.5533L13.436 20.7155C12.5407 21.2037 11.4587 21.2037 10.5634 20.7155L2.93114 16.5533C2.09726 16.0986 2.09715 14.9013 2.93095 14.4464Z"
        fill={color || '#333'}
      ></path>
    </svg>
  );
};

export default SequenceIcon;
