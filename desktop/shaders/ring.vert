#version 330 core

layout(location = 0) in vec3 in_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec2 v_local_pos;

void main() {
    v_local_pos = in_position.xz;
    gl_Position = u_projection * u_view * u_model * vec4(in_position, 1.0);
}
