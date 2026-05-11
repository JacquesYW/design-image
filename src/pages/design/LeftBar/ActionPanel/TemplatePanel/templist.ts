import { Panel } from '@/pages/design/interface';
import temp1 from '@/assets/images/tempImg/mainUrl/temp1.png';
import photos from '@/assets/images/photos';
export default [
  {
    mainUrl: temp1,
    mainData: {
      nm: 'test',
      id: 'test111111111111111',
      w: 1024,
      h: 2048,
      bg: {
        color: { c: { r: 255, g: 255, b: 255, a: 0 }, isLinear: false, linear: null },
        type: 'image',
        img: {
          p: photos[0],
          w: 3276.8,
          h: 2048,
          tr: {
            palette: {
              c: '#fff',
              o: 0.31,
            },
            clip: {
              s: 1,
              x: -1126.4,
              y: 0,
            },
          },
        },
      },
      layers: [
        {
          id: '6eee8262-0109-43b2-8815-824db9d24056',
          ty: 'text',
          nm: '文本',
          p: {
            ops: [
              {
                attributes: {
                  size: '94.0475px',
                  font: 'LiSu',
                  color: '#ce4c4c',
                },
                insert: '测试文本1',
              },
              {
                insert: '\n',
              },
            ],
          },
          isLocked: false,
          w: 451,
          h: null,
          flip: {
            v: false,
            h: false,
          },
          tr: {
            x: 316.67052023121386,
            y: 307.7919075144509,
            r: 0,
            o: 0.6,
            font: {
              defaultSize: '94.0475px',
              defaultFamily: 'LiSu',
              defaultColor: {
                r: 0,
                g: 0,
                b: 0,
                a: 1,
              },
              letterSpacing: 0,
              lineHeight: 1.4,
              align: 'center',
              strokeWidth: 0,
            },
          },
        },
        {
          id: '2fb16443-48de-468c-befa-5c9a94b0bb71',
          ty: 'text',
          nm: '文本',
          p: {
            ops: [
              {
                attributes: {
                  size: '141.67px',
                  font: 'Microsoft YaHei',
                  color: '#000000',
                },
                insert: '测试文本2',
              },
              {
                insert: '\n',
              },
            ],
          },
          isLocked: false,
          w: null,
          h: null,
          tr: {
            x: 20.09259653179191,
            y: 259.8151398843931,
            r: 0,
            o: 1,
            font: {
              defaultSize: '141.67px',
              defaultFamily: 'Microsoft YaHei',
              defaultColor: {
                r: 0,
                g: 0,
                b: 0,
                a: 1,
              },
              writingMode: 'vertical-rl',
              letterSpacing: 0,
              lineHeight: 1.4,
              align: 'center',
              ishaveFillColor: true,
              isShowFillColor: true,
              fillColor: {
                angle: 90,
                cs: [
                  {
                    c: {
                      r: 30,
                      g: 150,
                      b: 0,
                      a: 1,
                    },
                    p: 0,
                  },
                  {
                    c: {
                      r: 255,
                      g: 242,
                      b: 0,
                      a: 1,
                    },
                    p: 0.5,
                  },
                  {
                    c: {
                      r: 243,
                      g: 41,
                      b: 53,
                      a: 1,
                    },
                    p: 1,
                  },
                ],
              },
              ishaveStroke: true,
              isShowStroke: true,
              strokeColor: {
                angle: 90,
                cs: [
                  {
                    c: {
                      r: 34,
                      g: 84,
                      b: 244,
                      a: 1,
                    },
                    p: 0.2539,
                  },
                  {
                    c: {
                      r: 10,
                      g: 207,
                      b: 245,
                      a: 1,
                    },
                    p: 1,
                  },
                ],
              },
              strokeWidth: 17.708703949283564,
            },
          },
        },
        {
          id: 'c781776a-29d3-48eb-a5e8-2b49c512cbbb',
          ty: 'text',
          nm: '文本',
          p: {
            ops: [
              {
                attributes: {
                  size: '102.597px',
                  font: 'LiSu',
                  color: '#ce4c4c',
                },
                insert: '测',
              },
              {
                attributes: {
                  size: '102.597px',
                  font: 'LiSu',
                  color: '#ce4c4c',
                  underline: true,
                },
                insert: '试文',
              },
              {
                attributes: {
                  size: '102.597px',
                  font: 'LiSu',
                  color: '#ce4c4c',
                },
                insert: '本1',
              },
              {
                insert: '\n',
              },
            ],
          },
          isLocked: false,
          w: 510,
          h: null,
          flip: {
            v: true,
            h: true,
          },
          tr: {
            x: 316.57877456647395,
            y: 532.7167630057803,
            r: 0,
            o: 0.6,
            font: {
              defaultSize: '102.597px',
              defaultFamily: 'LiSu',
              defaultColor: {
                r: 0,
                g: 0,
                b: 0,
                a: 1,
              },
              letterSpacing: 0,
              lineHeight: 1.4,
              align: 'center',
              ishaveStroke: true,
              isShowStroke: true,
              strokeColor: {
                angle: 90,
                cs: [
                  {
                    c: {
                      r: 30,
                      g: 150,
                      b: 0,
                      a: 1,
                    },
                    p: 0,
                  },
                  {
                    c: {
                      r: 255,
                      g: 242,
                      b: 0,
                      a: 1,
                    },
                    p: 0.51,
                  },
                  {
                    c: {
                      r: 243,
                      g: 41,
                      b: 53,
                      a: 1,
                    },
                    p: 1,
                  },
                ],
              },
              strokeWidth: 23.939362384290337,
            },
          },
        },
        {
          ty: 'image',
          nm: '图片',
          p: '/src/assets/images/tempImg/one/circle.png',
          w: 843,
          h: 726,
          imgW: 843,
          imgH: 726,
          isLocked: false,
          tr: {
            x: 106.77715606936417,
            y: 149.00087861271675,
            r: 0,
            o: 1,
          },
          id: '478504a1-d727-4232-8542-93c41d878b9e',
        },
        {
          ty: 'image',
          nm: '图片',
          p: '/src/assets/images/photos/1.jpg',
          w: 475,
          h: 640,
          imgW: 475,
          imgH: 640,
          isLocked: false,
          tr: {
            x: 290.7775260115607,
            y: 1224.878612716763,
            o: 1,
            r: 0,
          },
          id: '2a2bde46-fa13-42db-bd9f-5a0c7b7cf60c',
        },
      ],
    },
  },
] as { mainUrl: string; mainData: Panel }[];
