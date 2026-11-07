import moderngl
import glm
import math
import os
from pathlib import Path
from .geometry import create_sphere, create_orbit_line, create_stars, create_ring

SHADER_DIR = Path(__file__).parent.parent / "shaders"


def _load_shader(name: str) -> tuple[str, str]:
    vert = (SHADER_DIR / f"{name}.vert").read_text()
    frag = (SHADER_DIR / f"{name}.frag").read_text()
    return vert, frag


PLANET_DATA = [
    {"id": "mercury", "name": "Mercury", "color": (0.71, 0.71, 0.71), "orbit_r": 4.0, "size": 0.35, "period": 87.97},
    {"id": "venus",   "name": "Venus",   "color": (0.91, 0.80, 0.63), "orbit_r": 6.0, "size": 0.87, "period": 224.70},
    {"id": "earth",   "name": "Earth",   "color": (0.10, 0.42, 0.60), "orbit_r": 8.5, "size": 0.92, "period": 365.25},
    {"id": "mars",    "name": "Mars",    "color": (0.76, 0.27, 0.06), "orbit_r": 11.0, "size": 0.53, "period": 686.97},
    {"id": "jupiter", "name": "Jupiter", "color": (0.78, 0.55, 0.23), "orbit_r": 16.0, "size": 1.80, "period": 4332.59},
    {"id": "saturn",  "name": "Saturn",  "color": (0.89, 0.82, 0.57), "orbit_r": 21.0, "size": 1.50, "period": 10759.22, "has_rings": True},
    {"id": "uranus",  "name": "Uranus",  "color": (0.49, 0.91, 0.91), "orbit_r": 26.0, "size": 1.20, "period": 30688.5},
    {"id": "neptune", "name": "Neptune", "color": (0.25, 0.33, 0.73), "orbit_r": 31.0, "size": 1.10, "period": 60182},
]

MOON_DATA = {"id": "moon", "name": "Moon", "color": (0.69, 0.69, 0.69), "orbit_r": 1.5, "size": 0.27, "period": 27.32}


class Renderer:
    def __init__(self, ctx: moderngl.Context):
        self.ctx = ctx
        self._build_programs()
        self._build_geometry()

        # Simulation angles
        import random
        random.seed(42)
        self.planet_angles = {p["id"]: random.uniform(0, math.pi * 2) for p in PLANET_DATA}
        self.moon_angle = random.uniform(0, math.pi * 2)
        self.sun_rotation = 0.0
        self.planet_rotations = {p["id"]: 0.0 for p in PLANET_DATA}

    def _build_programs(self):
        pv, pf = _load_shader("planet")
        self.planet_prog = self.ctx.program(vertex_shader=pv, fragment_shader=pf)

        ov, of = _load_shader("orbit")
        self.orbit_prog = self.ctx.program(vertex_shader=ov, fragment_shader=of)

        sv, sf = _load_shader("star")
        self.star_prog = self.ctx.program(vertex_shader=sv, fragment_shader=sf)

        rv, rf = _load_shader("ring")
        self.ring_prog = self.ctx.program(vertex_shader=rv, fragment_shader=rf)

    def _build_geometry(self):
        self.sphere_vbo, self.sphere_ibo, self.sphere_count = create_sphere(self.ctx, 32, 32)

        self.sphere_vao = self.ctx.vertex_array(
            self.planet_prog,
            [(self.sphere_vbo, '3f 3f 2f', 'in_position', 'in_normal', 'in_texcoord')],
            index_buffer=self.sphere_ibo,
        )

        # Ring geometry for Saturn
        self.ring_vbo, self.ring_ibo, self.ring_count = create_ring(self.ctx, 2.1, 3.6, 128)
        self.ring_vao = self.ctx.vertex_array(
            self.ring_prog,
            [(self.ring_vbo, '3f', 'in_position')],
            index_buffer=self.ring_ibo,
        )

        # Orbit lines
        self.orbit_vaos = {}
        for p in PLANET_DATA:
            vbo, count = create_orbit_line(self.ctx, p["orbit_r"])
            vao = self.ctx.vertex_array(
                self.orbit_prog,
                [(vbo, '3f', 'in_position')],
            )
            self.orbit_vaos[p["id"]] = (vao, count)

        # Moon orbit (around earth — will be offset at render)
        moon_vbo, moon_count = create_orbit_line(self.ctx, MOON_DATA["orbit_r"])
        self.moon_orbit_vao = (
            self.ctx.vertex_array(self.orbit_prog, [(moon_vbo, '3f', 'in_position')]),
            moon_count
        )

        # Stars
        star_vbo, self.star_count = create_stars(self.ctx, 3000)
        self.star_vao = self.ctx.vertex_array(
            self.star_prog,
            [(star_vbo, '3f 1f', 'in_position', 'in_brightness')],
        )

    def update(self, delta: float, speed: float, paused: bool):
        if paused:
            return
        factor = speed * delta * 0.01
        for p in PLANET_DATA:
            self.planet_angles[p["id"]] += (factor / p["period"]) * math.pi * 2
            self.planet_rotations[p["id"]] += delta * 0.5
        self.moon_angle += (factor / MOON_DATA["period"]) * math.pi * 2
        self.sun_rotation += delta * 0.05

    def get_planet_position(self, planet_id: str) -> glm.vec3:
        for p in PLANET_DATA:
            if p["id"] == planet_id:
                a = self.planet_angles[planet_id]
                return glm.vec3(math.cos(a) * p["orbit_r"], 0, math.sin(a) * p["orbit_r"])
        return glm.vec3(0)

    def get_moon_position(self) -> glm.vec3:
        earth_pos = self.get_planet_position("earth")
        a = self.moon_angle
        r = MOON_DATA["orbit_r"]
        return earth_pos + glm.vec3(math.cos(a) * r, 0, math.sin(a) * r)

    def render(self, view: glm.mat4, proj: glm.mat4, show_orbits: bool, selected: str | None):
        sun_pos = glm.vec3(0, 0, 0)

        # Stars
        self.ctx.disable(moderngl.DEPTH_TEST)
        self.ctx.enable(moderngl.PROGRAM_POINT_SIZE)
        self.star_prog['u_view'].write(view)
        self.star_prog['u_projection'].write(proj)
        self.star_vao.render(moderngl.POINTS, self.star_count)
        self.ctx.enable(moderngl.DEPTH_TEST)

        # Orbit paths
        if show_orbits:
            self.orbit_prog['u_view'].write(view)
            self.orbit_prog['u_projection'].write(proj)
            self.orbit_prog['u_color'].value = (1.0, 1.0, 1.0, 0.12)
            for pid, (vao, count) in self.orbit_vaos.items():
                vao.render(moderngl.LINE_STRIP, count)

        # Sun
        self._render_sphere(
            view, proj,
            pos=glm.vec3(0), size=2.5,
            color=(0.99, 0.72, 0.07),
            emissive=1.0, ambient=1.0,
            sun_pos=sun_pos,
            is_selected=(selected == "sun"),
        )

        # Planets
        for p in PLANET_DATA:
            a = self.planet_angles[p["id"]]
            pos = glm.vec3(math.cos(a) * p["orbit_r"], 0, math.sin(a) * p["orbit_r"])

            # Planet rotation
            rot_y = self.planet_rotations[p["id"]]
            self._render_sphere(
                view, proj, pos=pos,
                size=p["size"], color=p["color"],
                emissive=0.0, ambient=0.1,
                sun_pos=sun_pos,
                is_selected=(selected == p["id"]),
                rot_y=rot_y,
            )

            # Saturn rings
            if p.get("has_rings"):
                self._render_ring(view, proj, pos, p["size"])

        # Moon
        earth_pos = self.get_planet_position("earth")
        moon_pos = self.get_moon_position()
        self._render_sphere(
            view, proj, pos=moon_pos,
            size=MOON_DATA["size"], color=MOON_DATA["color"],
            emissive=0.0, ambient=0.1,
            sun_pos=sun_pos,
            is_selected=(selected == "moon"),
        )

    def _render_sphere(self, view, proj, pos, size, color, emissive, ambient, sun_pos, is_selected=False, rot_y=0.0):
        model = glm.mat4(1.0)
        model = glm.translate(model, pos)
        model = glm.rotate(model, rot_y, glm.vec3(0, 1, 0))
        model = glm.scale(model, glm.vec3(size))

        self.planet_prog['u_model'].write(model)
        self.planet_prog['u_view'].write(view)
        self.planet_prog['u_projection'].write(proj)
        self.planet_prog['u_color'].value = color
        self.planet_prog['u_sun_pos'].value = (sun_pos.x, sun_pos.y, sun_pos.z)
        self.planet_prog['u_emissive'].value = emissive
        self.planet_prog['u_ambient'].value = ambient
        self.sphere_vao.render(moderngl.TRIANGLES, self.sphere_count)

    def _render_ring(self, view, proj, planet_pos, planet_size):
        model = glm.mat4(1.0)
        model = glm.translate(model, planet_pos)
        model = glm.rotate(model, 0.4, glm.vec3(1, 0, 0))
        model = glm.scale(model, glm.vec3(planet_size))

        self.ctx.disable(moderngl.DEPTH_TEST)
        self.ring_prog['u_model'].write(model)
        self.ring_prog['u_view'].write(view)
        self.ring_prog['u_projection'].write(proj)
        self.ring_prog['u_color'].value = (0.89, 0.82, 0.57)
        self.ring_prog['u_inner'].value = 2.1
        self.ring_prog['u_outer'].value = 3.6
        self.ring_vao.render(moderngl.TRIANGLES, self.ring_count)
        self.ctx.enable(moderngl.DEPTH_TEST)
