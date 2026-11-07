#version 330 core

in vec2 v_local_pos;

uniform vec3 u_color;
uniform float u_inner;
uniform float u_outer;

out vec4 out_color;

void main() {
    float dist = length(v_local_pos);
    if (dist < u_inner || dist > u_outer) discard;

    float alpha = 0.65;
    float edge_fade = min(
        smoothstep(u_inner, u_inner + 0.3, dist),
        smoothstep(u_outer, u_outer - 0.3, dist)
    );
    alpha *= edge_fade;

    out_color = vec4(u_color, alpha);
}
