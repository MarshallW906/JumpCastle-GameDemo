

- Skybox: 
  - https://doc.babylonjs.com/babylon101/environment>
  - If you want some free skybox texture samples, point your browser to: <http://3delyvisions.co/skf1.htm> (look at licenses before use, please.) 

To help you generate those gray-scale height maps, you can use software such as “**Terragen**”, or ”**Picogen**”.



**Tips** When the user is manipulating the camera, it can be awkward if he can see under the ground, or if he zooms-out outside the skybox. So, to avoid that kind of situation, we can constrain the camera movement:

```javascript
var camerasBorderFunction = function () {
        //Angle
        if (camera.beta < 0.1)
            camera.beta = 0.1;
        else if (camera.beta > (Math.PI / 2) * 0.9)
            camera.beta = (Math.PI / 2) * 0.9;

  //Zoom
        if (camera.radius > 150)
            camera.radius = 150;

        if (camera.radius < 30)
            camera.radius = 30;
    };

    scene.registerBeforeRender(camerasBorderFunction);
```



## Available packages

We offer babaylon.js' core and its modules as npm packages. The following are available:

- [babylonjs](https://www.npmjs.com/package/babylonjs) - Babylon's core.
- [babylonjs-materials](https://www.npmjs.com/package/babylonjs-materials) - a collection of Babylon-supported advanced materials.
- [babylonjs-loaders](https://www.npmjs.com/package/babylonjs-loaders) - All of Babylon's official loaders (OBJ, STL, glTF)
- [babylonjs-post-process](https://www.npmjs.com/package/babylonjs-post-process) - Babylon's post processes.
- [babylonjs-procedural-textures](https://www.npmjs.com/package/babylonjs-procedural-textures) - Officially supported procedural textures
- [babylonjs-serializers](https://www.npmjs.com/package/babylonjs-serializers) - Scene / mesh serializers.
- [babylonjs-gui](https://www.npmjs.com/package/babylonjs-gui) - BabylonJS GUI module.
- [babylonjs-viewer](https://www.npmjs.com/package/babylonjs-viewer) - The stand-alone BabylonJS Viewer.