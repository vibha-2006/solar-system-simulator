import numpy as np
import moderngl
import math


def create_sphere(ctx: moderngl.Context, stacks: int = 32, slices: int = 32) -> tuple:
    vertices = []
    indices = []

    for i in range(stacks + 1):
        phi = math.pi / 2 - i * math.pi / stacks
        y = math.sin(phi)
        r = math.cos(phi)

        for j in range(slices + 1):
            theta = j * 2 * math.pi / slices
            x = r * math.cos(theta)
            z = r * math.sin(theta)

            u = j / slices
            v = i / stacks

            # position, normal, texcoord
            vertices.extend([x, y, z, x, y, z, u, v])

    for i in range(stacks):
        for j in range(slices):
            a = i * (slices + 1) + j
            b = a + slices + 1
            indices.extend([a, b, a + 1, b, b + 1, a + 1])

    vbo = ctx.buffer(np.array(vertices, dtype='f4').tobytes())
    ibo = ctx.buffer(np.array(indices, dtype='i4').tobytes())
    return vbo, ibo, len(indices)


def create_ring(ctx: moderngl.Context, inner: float, outer: float, segments: int = 128) -> tuple:
    vertices = []
    indices = []

    for i in range(segments + 1):
        theta = i * 2 * math.pi / segments
        c, s = math.cos(theta), math.sin(theta)

        # inner vertex
        vertices.extend([c * inner, 0.0, s * inner])
        # outer vertex
        vertices.extend([c * outer, 0.0, s * outer])

    for i in range(segments):
        a = i * 2
        b = a + 1
        c = a + 2
        d = a + 3
        indices.extend([a, b, c, b, d, c])

    vbo = ctx.buffer(np.array(vertices, dtype='f4').tobytes())
    ibo = ctx.buffer(np.array(indices, dtype='i4').tobytes())
    return vbo, ibo, len(indices)


def create_orbit_line(ctx: moderngl.Context, radius: float, segments: int = 128) -> tuple:
    pts = []
    for i in range(segments):
        a = i * 2 * math.pi / segments
        pts.extend([math.cos(a) * radius, 0.0, math.sin(a) * radius])
    # close
    pts.extend([pts[0], pts[1], pts[2]])
    vbo = ctx.buffer(np.array(pts, dtype='f4').tobytes())
    return vbo, segments + 1


def create_stars(ctx: moderngl.Context, count: int = 3000) -> tuple:
    rng = np.random.default_rng(42)
    # Spherical distribution
    theta = rng.uniform(0, 2 * math.pi, count)
    phi = np.arccos(rng.uniform(-1, 1, count))
    r = rng.uniform(250, 400, count).astype('f4')

    x = (r * np.sin(phi) * np.cos(theta)).astype('f4')
    y = (r * np.sin(phi) * np.sin(theta)).astype('f4')
    z = (r * np.cos(phi)).astype('f4')
    brightness = rng.uniform(0.3, 1.0, count).astype('f4')

    data = np.column_stack([x, y, z, brightness]).flatten().astype('f4')
    vbo = ctx.buffer(data.tobytes())
    return vbo, count
