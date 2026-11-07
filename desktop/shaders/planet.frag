#version 330 core

in vec3 v_normal;
in vec3 v_world_pos;
in vec2 v_texcoord;

uniform vec3 u_color;
uniform vec3 u_sun_pos;
uniform float u_emissive;
uniform float u_ambient;

out vec4 out_color;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 light_dir = normalize(u_sun_pos - v_world_pos);

    float diffuse = max(dot(normal, light_dir), 0.0);
    float ambient = u_ambient;

    vec3 lit_color = u_color * (ambient + diffuse * (1.0 - ambient));
    vec3 final_color = mix(lit_color, u_color, u_emissive);

    out_color = vec4(final_color, 1.0);
}
