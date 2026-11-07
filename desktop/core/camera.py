import glm
import math


class Camera:
    def __init__(self):
        self.yaw = -90.0
        self.pitch = -40.0
        self.distance = 42.0
        self.target = glm.vec3(0, 0, 0)
        self.fov = 45.0
        self._mouse_last = None
        self._mouse_btn = {1: False, 2: False, 3: False}

    def reset(self):
        self.yaw = -90.0
        self.pitch = -40.0
        self.distance = 42.0
        self.target = glm.vec3(0, 0, 0)

    @property
    def position(self) -> glm.vec3:
        rad_yaw = math.radians(self.yaw)
        rad_pitch = math.radians(self.pitch)
        x = self.distance * math.cos(rad_pitch) * math.cos(rad_yaw)
        y = self.distance * math.sin(rad_pitch)
        z = self.distance * math.cos(rad_pitch) * math.sin(rad_yaw)
        return self.target + glm.vec3(x, y, z)

    def get_view(self) -> glm.mat4:
        return glm.lookAt(self.position, self.target, glm.vec3(0, 1, 0))

    def get_projection(self, aspect: float) -> glm.mat4:
        return glm.perspective(glm.radians(self.fov), aspect, 0.1, 2000.0)

    def handle_mouse_button(self, btn: int, down: bool, pos):
        self._mouse_btn[btn] = down
        self._mouse_last = pos if down else None

    def handle_mouse_motion(self, pos, rel):
        if self._mouse_btn.get(1):  # Left — rotate
            self.yaw += rel[0] * 0.3
            self.pitch -= rel[1] * 0.3
            self.pitch = max(-89.0, min(89.0, self.pitch))
        elif self._mouse_btn.get(3):  # Right — pan
            right = glm.normalize(glm.cross(self.target - self.position, glm.vec3(0, 1, 0)))
            up = glm.normalize(glm.cross(right, self.target - self.position))
            self.target -= right * rel[0] * self.distance * 0.001
            self.target += up * rel[1] * self.distance * 0.001

    def handle_scroll(self, y: float):
        self.distance *= (0.9 if y > 0 else 1.1)
        self.distance = max(5.0, min(200.0, self.distance))

    def zoom(self, direction: str):
        if direction == 'in':
            self.distance *= 0.85
        else:
            self.distance *= 1.18
        self.distance = max(5.0, min(200.0, self.distance))
