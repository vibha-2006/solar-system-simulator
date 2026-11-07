import pygame
import moderngl
from typing import Tuple


class Window:
    def __init__(self, title: str = "NOVA — Solar System Simulator", size: Tuple[int, int] = (1280, 720)):
        pygame.init()
        self.width, self.height = size

        pygame.display.set_caption(title)
        flags = pygame.OPENGL | pygame.DOUBLEBUF | pygame.RESIZABLE
        self.surface = pygame.display.set_mode((self.width, self.height), flags)

        pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MAJOR_VERSION, 3)
        pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MINOR_VERSION, 3)
        pygame.display.gl_set_attribute(pygame.GL_CONTEXT_PROFILE_MASK, pygame.GL_CONTEXT_PROFILE_CORE)
        pygame.display.gl_set_attribute(pygame.GL_DOUBLEBUFFER, 1)
        pygame.display.gl_set_attribute(pygame.GL_DEPTH_SIZE, 24)

        self.ctx = moderngl.create_context()
        self.ctx.enable(moderngl.DEPTH_TEST)
        self.ctx.enable(moderngl.BLEND)
        self.ctx.blend_func = moderngl.SRC_ALPHA, moderngl.ONE_MINUS_SRC_ALPHA

        print(f"OpenGL {self.ctx.version_code // 100}.{(self.ctx.version_code % 100) // 10} Core Profile")
        print(f"ModernGL {moderngl.__version__}")
        print(f"Renderer: {self.ctx.info['GL_RENDERER']}")

    def on_resize(self, w: int, h: int):
        self.width, self.height = w, h
        self.ctx.viewport = (0, 0, w, h)

    def swap_buffers(self):
        pygame.display.flip()

    def clear(self):
        self.ctx.clear(0.03, 0.05, 0.1, 1.0)

    @property
    def aspect(self) -> float:
        return self.width / max(self.height, 1)
