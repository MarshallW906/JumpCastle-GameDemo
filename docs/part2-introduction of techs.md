1. HTML5是HTML的最新标准。在2014年公布的HTML5规范中，新增了一些新的元素、属性和行为，包括用于绘图的canvas元素、svg元素，用于媒体播放的video元素和audio元素等。这些元素为游戏开发提供了极大的支持。

   HTML5规范公布之前，网页大多依靠Adobe Flash Player来呈现多媒体内容。Flash Player在过去20年内拥有超高的普及率，但基于FlashPlayer的网页和程序，加载非常缓慢，存在严重的能耗问题。安全方面，FlashPlayer自从发布以来就不断爆出重大安全漏洞，即使Adobe公司不断对其进行修补更新，插件存在的各种问题还是不能解决。另外，如果使用embed和object标签来播放媒体，则必须对这些标签赋予大量具体参数，实现过程极为繁复。HTML5的出现解决了网页中播放多媒体内容的问题，视频元素只需要指定源文件地址，而游戏也可以使用canvas标签实现，比之前通过大量使用DOM元素实现简单得多。

   HTML5的canvas元素使网页具备了更强的交互能力。canvas提供了一系列方便的绘制图形及动画的接口。目前市面上的大多JavaScript游戏引擎，底层均为基于HTML5+WebGL。选择使用HTML5进行游戏开发，可以使得游戏和网页中的其他内容能够有机结合在一起，与整体网页内容更加相称。

2. CSS3
   CSS3新增了一系列方便使用的新特性，如2D-transform, 3D-transform, animation, box-model, border, linear-gradient等等。这些特性的出现，使得网页动画效果的实现难度大大降低。原来需要通过一系列复杂的JavaScript函数或Flash, Photoshop等软件才可以完成的效果，现在只需要通过简单的CSS设置就可以实现。如：CSS3出现之前，圆角边框效果必须通过Photoshop等图片编辑软件制作出图片，然后作为背景来实现，而CSS3可以通过直接设置标签的border-radius属性，从而省去了通过设计师控制边框的样式；在CSS3之前，动画效果如旋转、位移、缩放、拉伸，都需要通过制作Flash动画之后嵌入实现，CSS3出现后，则可以直接通过控制标签的transform属性，来设置元素的动画效果。通过恰当的使用， CSS3同样可以做出复杂的Flash效果。

3. WebGL

   WebGL全称为Web Graphics Library，即用于网页端的绘图库，是非营利技术联盟Khronos Group开发的一种3D绘图协议。协议将JavaScript与OpenGL ES规范结合，提供了一组可以在网页中直接绘制复杂2D、3D图形的JavaScript API。传统意义上来说，只有高性能的计算机才可以渲染3D画面，近年来，由于硬件计算性能的不断提升，3D渲染已经得到广泛普及。WebGL的出现，结合HTML5和JavaScript使得在网页浏览器中创建和渲染复杂3D画面也成为可能。

   WebGL程序，包括使用JavaScript写的控制代码、在图形处理单元（GPU, Graphcis Processing Unit）中执行的特效代码（shader code，渲染代码）。WebGL元素的兼容性优秀，可以与其他HTML5元素混合使用。

4. BabylonJS

   BabylonJS是一款基于HTML5和WebGL的开源3D游戏引擎，最初是由两位微软职员David Catuhe和David Rousset在业余时间开发，初版于2013年发布。经过几年的发展，BabylonJS成为了较为成熟的3D游戏引擎，并且登上了2015年在巴黎举办的WebGL会议。迄今为止，其在Github上的项目已有超过200名代码贡献者，用户数量也在不断扩大。著名大型游戏公司Ubisoft也曾在其开发过程中使用了BabylonJS引擎。

   JumpCastle游戏使用BabylonJS作为开发使用的游戏引擎。直接编写WebGL来开发游戏十分复杂且代码难以维护，开发者需要了解WebGL的内部细节，学习复杂的着色器语法，并且具有较为完备的图形学知识，这对于大多数游戏开发者来说并不现实。BabylonJS引擎提供了一套完备易用的、适合游戏开发的JavaScript API，使得开发者不必过多了解WebGL的细节，就可以创建漂亮的三维图形，开发出精美的游戏。

5. Blender

   Blender是最初由荷兰动画工作室NeoGeo在1998年开发的一款著名的开源跨平台三维动画制作软件。在经历了长期的发展和几次开发组织的更换后，目前软件已拥有方便在不同工作环境下使用的多种用户界面，同时提供了一套完备的3D动画制作解决方案。具体功能包含从建模、动画、材质、渲染、音频视频处理及剪辑等基本功能，以及绿屏抠像、摄像机反向跟踪、遮罩处理、后期节点合成等高级功能，同时还内置有卡通秒变（FreeStyle）和基于GPU的Cycles渲染器。同时，Blender以Python为内建脚本，也能够支持多种第三方渲染器。

   使用Blender制作的模型，可以通过内置的导出器，在特定的设置下，可以直接将模型文件导出成BabylonJS支持的数据格式。同时，使用Blender制作的动画，目前在社区中也已经有了非官方的导出方式。【这里再简单加上Blender向外导出到BabylonJS的方法】

6. Webpack

   Webpack是目前被广泛使用的一种基于Nodejs的模块加载器兼打包工具。Webpack把网页开发使用的各种资源都作为模块使用和处理，从而可以把JavaScript(含JSX)脚本, coffee, css(含less/sass), images等都进行有序的打包。同时，Webpack通过独特的设计，能够有效避免JS开发过程中的全局引用污染，做到模块之间的隔离，同时支持模块热替换、懒加载等方便开发的功能，并且通过构建依赖图（dependency graph）实现了自动重新构建。

   Webpack底层是通过commonJS的形式来书写，同时对旧版本的项目代码支持也很全面，方便旧项目进行代码迁移。使用Webpack开发十分便捷，它可以代替部分grunt/gulp的工作，实现打包、压缩混淆、图片转base64等。同时，Webpack扩展性强、插件机制完善，特别是支持React热插拔(React-hot-loader)，使得开发效率大幅提升。通过对webpack.config.js进行设置，可以使Webpack快速完成多目标构建、开发/生产模式切换等常用开发功能。