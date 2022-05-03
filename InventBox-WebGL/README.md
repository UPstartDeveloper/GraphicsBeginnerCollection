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
