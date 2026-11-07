#version 330 core

in float v_brightness;
out vec4 out_color;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, r) * v_brightness;
    vec3 color = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.95, 0.85), v_brightness);
    out_color = vec4(color, alpha);
}
