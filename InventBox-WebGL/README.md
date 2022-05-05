# Learn WebGL Course

Source: https://www.youtube.com/watch?v=bP7_FeP9kU4&list=PL2935W76vRNHFpPUuqmLoGCzwx_8eq5yK&index=1

Credit to Darius for making this!

## 1: Intro
1. WebGL = JS port of OpenGL
    1. 1.0 - only goes up to OpenGL 2.0, but all support across browsers
    2. 2.0 - goes up to the latest OpenGL 3.0, it IS supported now on all browsers
2. It is not OOP, like the `canvas` API we have in the DOM (but it can do 3D very fast).

## 2: How WebGL Works

1. WebGL - like OpenGL - represents everything using *vertices* and *edges*
    1. vertices store info like:
        - coordinates,
        - color info
        - normal = this is the vector that is orthogonal to the surface of the point. becomes useful for things like lighting for example, b/c it tells WebGL which "way" the vertex is facing
2. Coordinate System
    1. "right-handed" - +Z towards you, and XY are horizontal and vertical
3. High-level Overview of Rendering in WebGL, from a HW Perspective::
    1. CPU
        1. running JS - make a `Float32Array` to store vertices
    2. GPU
        1. loads the vertices into a buffer (some storage loc for bytes)
        2. you instruct WebGL what to do with this data
            1. this creates the *primitives* in your scene - tris, points
        3. then comes your shader program
            1. via the *vertex shader* (determines where all the vertices go) and *fragment shader* (determines color of each pixel)
            2. related are *uniforms* - global variables used by the shaders
    3. Display - now you can get to see the image!
        1. WebGL uses a double buffer   
            1. one is visible to the user
            2. the other is the image to-be-seen - handled under the hood

## 4: Multi-color Triangle (Vertex Attributes Tutorial)
    1. Generic attrs of primitives
        a. stores a ref to a named attr
        b. AND a ref to an array with the buffer data you care about
        c. How to use:
            i. declare the generic attr of the vertices (can ONLY go by vertex, not per-pixel)
            ii. use it in the vertex shader
            iii. enable it in JS using `gl.enableVertexAttribPointer
            iv. do this after linking!

## 5: Spinning Triangle (matrix tutorial)
    1. the default clipping space in WebGL is outside [-1, 1] in XY plane.
        a. note that although the coordinate space is the same in both X and Y, the actual distaces are not the same (by default, you can change this by setting `width` and `height`)
        b. that is because the HTML canvas itself is not a perfect square 
    2. in WebGL, the order that the matrix transformation are applied to your vertices is in the *reverse* order of how you defined them in code

## 6: Spinning Cube
    1. only by rotating along all the 3 coordinate axes do we see all the faces!

## 7: Cube with Perspective
    1. perspective = type of projection
    2. near should not be 0 --> far too small, mathematically it doesn't work
    3. far plane = can be decreased to help improve performance
    4. need to do perspective projection AFTER all the other geometric transforms

## 8: Moving the Camera Around (View Matrix)
    1. Motivation: cameras are important for when the world is too big, and we only want to look at certain things at once
    2. Camera starts out at the origin. It *always* has to be at the origin.
    3. Theory vs. Implementation:
        a. theory: what we want is to move the world objects a little, move the camera, and we get a new view of the scene
        b. in code: we can ONLY transform the world objects
            1. compute the change that would happen to the camera (the camera transform)
            2. apply the (additive) inverse of that to the scene objects (in addition to whatever transforms they will have) - so that it lets the camera stay at the origins, but relatively it's orientation is the same distance away as we wanted
    4. Object transformation (`To`) =  model matrix, applied to the objects in the scene
    5. Camera transformation (`Tc`) = camera matrix
    6. Result = `To - Tc  # i.e. where the scene objects finally end up`

## 9: The Point Cloud
    1. How to create a point cloud:
        a. can use a function + a for loop, basically
    2. When you use `gl.POINTS` in `gl.drawArrays()`, you need to set `gl_PointSize` in the vertex shader.
    3. If you don't enable the depth test --> you get a point cloud
        a. but if you do - it basically looks like a sphere.

## 10: Drawing Images

1. We do this via textures!
2. We bind textures just we do buffers
3. UV coords map textures to objects (treat like an attribute)
    a. From [Wikipedia](https://en.wikipedia.org/wiki/UV_mapping): 
        
        i. projection of 2D texture image onto a 3D model
        ii. we use UV because we're in 2D (and we don't want to reuse XY because those describe world space coordinates)
4. more on [UV coordinates](https://stackoverflow.com/questions/3314219/how-do-u-v-coordinates-work), by Michael Cole on Stack Overflow:
    a. they are *bounded* between 0 to 1.
    b. it is *relative* - 

        i. as a corollary - we don't need units to describes UV coords
        ii. we do need to be very intentional when wrapping 2D textures around 3D geometries that are not really analogous to it - e.g. a sqaure texture on to a sphere
5. You can create an unlimited number of textures, but only attach 96 of them at a time (at least in WebGL 1.0).
    a. these textures are attached at slots/locations, numbered starting at gl.TEXTURE0.

6. texel = "textured pixel"

## 11: Diffuse Lighting Tutorial
1. Motivation: lighting lets us:
    a. see where vertices are 
    b. see internal edges of 3D meshes (e.g. lines on a box)
    c. in short - be more realistic!
2. Surface Normals:
    a. a normalized vector that is normal to a surface (tells you where the surface is pointing "outwards")
3. Diffuse Lighting uses angles:
    a. brightness = cos(theta), where theta = angle between surface normal, and the direction in which light travels (should also be a normalized vector)
    b. why cosine?

        i. acute angle (of 0-90) --> the surface is black
        ii. obtuse angle (of 90-180) --> surface is lit

4. In code, cosine(theta), where theta is the angle between `A` and `B` vectors is the *dot product*
5. The sin(theta) would be the *cross product*
6. note: semi-colons are ALWAYS needed at the end of lines in GLSL!