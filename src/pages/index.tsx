// import Image_Material from "./components/material/Image";
import TransformOperation, { matrixMulti } from '@/utils/transform';
import { isHit } from './components/editer/SelectToAndMoveableTool';

const Main = () => {
  const ref = useRef<TransformOperation>();
  useEffect(() => {
    ref.current = new TransformOperation({ width: 200, height: 200 });
    ref.current.setData({
      scale: 1.5,
      skew: { x: 10, y: 10 },
      rotate: 45,
      translate: { x: 50, y: 50 },
    });
    console.log(ref.current.getMatrixStr());
    console.log(ref.current.rotateMatrix);
    console.log(matrixMulti(ref.current.rotateMatrix, [50 + 32 / 2, 50 + 97 / 2, 1]));
  }, []);
  return (
    <div
      style={{
        width: '500px',
        height: '500px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        border: '1px solid',
        backgroundColor: '#f1f1f1',
      }}
      onClick={(e) => {
        console.log(
          'isHit',
          isHit(
            {
              x: e.clientX,
              y: e.clientY,
            },
            document.getElementById('aa') as HTMLElement,
          ),
        );
      }}
    >
      {/* <button
        onClick={() => {
          setD(!d);
        }}
      >
        1111
      </button> */}
      <></>
      <div
        id="aa"
        style={{ width: 200, height: 30, background: '#fff', position: 'absolute', top: 37, left: 100 }}
      ></div>
      <img alt="" />
    </div>
  );
};

export default Main;
/* 
 类似五角星
 ctx: canvas对象
 x: 位置
 y: 位置
 n: 角数
i: 内角
e: 外角
  
  function star(ctx, x, y, n, i, e) {
    ctx.beginPath();
    ctx.moveTo(x, y - i);
    for (var r = 1; r < 2 * n; r++) {
      var o = r % 2 == 0 ? i : e;
      var a = o * Math.sin((r * Math.PI) / n);
      var s = -1 * o * Math.cos((r * Math.PI) / n);
      ctx.lineTo(a + x, s + y);
    }
    ctx.lineTo(x, y - i);
    ctx.closePath();
  }

*/
