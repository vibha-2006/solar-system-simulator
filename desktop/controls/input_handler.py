import pygame
from desktop.core.camera import Camera

PLANET_IDS = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "moon"]


class InputHandler:
    def __init__(self, camera: Camera):
        self.camera = camera
        self._planet_cycle_idx = 3  # start at earth

    def process(self, events, state: dict) -> dict:
        for event in events:
            if event.type == pygame.QUIT:
                state["running"] = False

            elif event.type == pygame.KEYDOWN:
                state = self._handle_key(event, state)

            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.camera.handle_mouse_button(event.button, True, event.pos)
                if event.button == 4:
                    self.camera.handle_scroll(1)
                elif event.button == 5:
                    self.camera.handle_scroll(-1)

            elif event.type == pygame.MOUSEBUTTONUP:
                self.camera.handle_mouse_button(event.button, False, event.pos)

            elif event.type == pygame.MOUSEMOTION:
                self.camera.handle_mouse_motion(event.pos, event.rel)

            elif event.type == pygame.VIDEORESIZE:
                state["resize"] = (event.w, event.h)

        return state

    def _handle_key(self, event, state: dict) -> dict:
        SPEED_STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000]

        if event.key == pygame.K_SPACE:
            state["paused"] = not state["paused"]

        elif event.key == pygame.K_r:
            self.camera.reset()

        elif event.key == pygame.K_o:
            state["orbits"] = not state["orbits"]

        elif event.key == pygame.K_c:
            state["compare_mode"] = not state.get("compare_mode", False)

        elif event.key == pygame.K_f:
            pygame.display.toggle_fullscreen()

        elif event.key == pygame.K_ESCAPE:
            if state.get("compare_mode"):
                state["compare_mode"] = False
            else:
                state["selected"] = None

        elif event.key == pygame.K_UP:
            idx = SPEED_STEPS.index(state["speed"]) if state["speed"] in SPEED_STEPS else 4
            state["speed"] = SPEED_STEPS[min(idx + 1, len(SPEED_STEPS) - 1)]

        elif event.key == pygame.K_DOWN:
            idx = SPEED_STEPS.index(state["speed"]) if state["speed"] in SPEED_STEPS else 4
            state["speed"] = SPEED_STEPS[max(idx - 1, 0)]

        elif event.key == pygame.K_EQUALS or event.key == pygame.K_PLUS:
            self.camera.zoom("in")

        elif event.key == pygame.K_MINUS:
            self.camera.zoom("out")

        elif event.key == pygame.K_l:
            self._planet_cycle_idx = (self._planet_cycle_idx + 1) % len(PLANET_IDS)
            state["selected"] = PLANET_IDS[self._planet_cycle_idx]

        elif event.key == pygame.K_1:
            state["selected"] = "sun"
        elif event.key == pygame.K_2:
            state["selected"] = "mercury"
        elif event.key == pygame.K_3:
            state["selected"] = "venus"
        elif event.key == pygame.K_4:
            state["selected"] = "earth"
        elif event.key == pygame.K_5:
            state["selected"] = "mars"
        elif event.key == pygame.K_6:
            state["selected"] = "jupiter"
        elif event.key == pygame.K_7:
            state["selected"] = "saturn"
        elif event.key == pygame.K_8:
            state["selected"] = "uranus"
        elif event.key == pygame.K_9:
            state["selected"] = "neptune"
        elif event.key == pygame.K_0:
            state["selected"] = "moon"

        return state
