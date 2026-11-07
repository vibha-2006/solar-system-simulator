#!/usr/bin/env python3
"""
Solar System Simulator
Desktop Application — OpenGL 3.3 Core + ModernGL + pygame-ce
"""

import sys
import os

# Ensure the project root is in PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pygame
import moderngl
import time

from desktop.core.window import Window
from desktop.core.camera import Camera
from desktop.rendering.renderer import Renderer
from desktop.ui.hud import HUD
from desktop.controls.input_handler import InputHandler


def main():
    print("=" * 60)
    print("Solar System Simulator — Interactive 3D Solar System Simulator")
    print("Desktop | OpenGL 3.3 Core + ModernGL + pygame-ce")
    print("=" * 60)

    win = Window("Solar System Simulator — Solar System Simulator", (1280, 720))
    camera = Camera()
    renderer = Renderer(win.ctx)
    input_handler = InputHandler(camera)

    # Create a pygame surface for 2D HUD
    hud_surface = pygame.Surface((win.width, win.height), pygame.SRCALPHA)
    hud = HUD(hud_surface)

    state = {
        "running": True,
        "paused": False,
        "speed": 50,
        "orbits": True,
        "selected": "earth",
        "compare_mode": False,
        "fps": 0,
        "resize": None,
    }

    clock = pygame.time.Clock()
    fps_timer = 0.0
    fps_count = 0
    last_time = time.time()

    print(f"\nRunning. Controls:")
    print("  Mouse Left drag = Rotate camera")
    print("  Mouse Right drag = Pan")
    print("  Mouse Scroll = Zoom")
    print("  SPACE = Pause/Resume")
    print("  R = Reset Camera")
    print("  O = Toggle Orbits")
    print("  L = Cycle planet selection")
    print("  1-9, 0 = Select planet by number")
    print("  F = Fullscreen")
    print("  ESC = Close panel")
    print("  Arrow Up/Down = Increase/Decrease speed")
    print()

    while state["running"]:
        now = time.time()
        delta = min(now - last_time, 0.05)
        last_time = now

        events = pygame.event.get()
        state = input_handler.process(events, state)

        if state.get("resize"):
            win.on_resize(*state["resize"])
            hud_surface = pygame.Surface((win.width, win.height), pygame.SRCALPHA)
            hud = HUD(hud_surface)
            state["resize"] = None

        renderer.update(delta, state["speed"], state["paused"])
        view = camera.get_view()
        proj = camera.get_projection(win.aspect)

        win.clear()
        renderer.render(view, proj, state["orbits"], state.get("selected"))

        # 2D HUD overlay
        hud_surface.fill((0, 0, 0, 0))
        fps_timer += delta
        fps_count += 1
        if fps_timer >= 1.0:
            state["fps"] = fps_count
            fps_count = 0
            fps_timer = 0.0

        hud.draw(state)

        # Blit HUD surface using a texture-based approach
        # We use pygame's raw pixel approach to composite 2D on top of 3D
        raw = pygame.image.tostring(hud_surface, "RGBA", False)
        win.ctx.enable(moderngl.BLEND)
        # Simple compositing: blit pygame surface directly to display
        # We switch to 2D mode for HUD
        pygame.display.get_surface().blit(hud_surface, (0, 0))

        win.swap_buffers()
        clock.tick(60)

    pygame.quit()
    print("Solar System Simulator desktop application closed.")


if __name__ == "__main__":
    main()
