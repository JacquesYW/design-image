# design-image

English: [README.md](./README.md)

说明：这是一个个人娱乐性质的小项目，最初是为了给孩子做家庭作业相关的图片内容而写的。

`design-image` 是一个基于浏览器的可视化图片编辑器，适合用来组合海报、分享图、活动图、二维码图片以及多画板视觉内容。

在线 Demo：https://jacquesyw.github.io/design-image/

## 功能概览

- 支持多画板编辑，每个画板可独立设置尺寸和背景
- 内置模板，可快速切换预设版式
- 支持添加图片图层、文字图层、二维码图层
- 提供较完整的文字编辑能力
- 支持字体、字号、对齐、行高、字间距、填充、描边等设置
- 支持图层拖拽、缩放、旋转和多选操作
- 支持多图层对齐与等距分布
- 支持图层层级调整
- 支持复制、删除、锁定/解锁图层
- 支持撤销 / 重做
- 支持背景图替换与背景颜色切换
- 支持参考线显示
- 支持导出 PNG
- 支持动画预览与 APNG 导出

## 适用场景

- 活动海报编辑
- 营销图片生成
- 社交分享图制作
- 二维码海报拼装
- 多页视觉内容原型设计

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- Less
- `html-to-image`
- `moveable`
- `selecto`
- `gsap`
- `quill`

## 项目结构

```text
src/
  pages/design/         编辑器主流程与页面
  pages/components/     通用编辑组件与素材组件
  utils/                图层、变换、图片处理等工具函数
  assets/               模板、示例图片与样式资源
```

## 本地开发

安装依赖并启动开发环境：

```bash
pnpm install
pnpm start
```

构建生产包：

```bash
pnpm build
```

## 部署说明

当前仓库已经配置为通过 GitHub Actions 发布到 GitHub Pages。

- Pages Source：`GitHub Actions`
- Demo 地址：`https://jacquesyw.github.io/design-image/`

## 说明

- 仓库内包含模板和示例素材，便于直接体验编辑器能力
- 当前项目已经按 GitHub Pages 的项目路径方式配置了 Vite `base`
