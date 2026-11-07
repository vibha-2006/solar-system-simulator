#version 330 core

layout(location = 0) in vec3 in_position;
layout(location = 1) in float in_brightness;

uniform mat4 u_view;
uniform mat4 u_projection;

out float v_brightness;

void main() {
    v_brightness = in_brightness;
    gl_PointSize = 1.5 + in_brightness * 1.5;
    gl_Position = u_projection * u_view * vec4(in_position, 1.0);
}
