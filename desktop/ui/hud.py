import pygame

# Color palette — Deep Observatory theme
BG_PANEL = (5, 10, 20, 220)
BG_CARD  = (7, 13, 26, 200)
TEXT_PRIMARY   = (174, 196, 216)
TEXT_SECONDARY = (106, 128, 153)
TEXT_MUTED     = (58, 80, 96)
ACCENT_TEAL    = (0, 217, 170)
ACCENT_GOLD    = (221, 168, 58)
ACCENT_GREEN   = (34, 197, 94)
BORDER = (255, 255, 255, 18)

PLANETS_INFO = {
    "sun":     {"name": "Sun",     "class": "G-Type Main-Sequence Star", "color": (253, 184, 19)},
    "mercury": {"name": "Mercury", "class": "Terrestrial Planet",       "color": (181, 181, 181)},
    "venus":   {"name": "Venus",   "class": "Terrestrial Planet",       "color": (232, 205, 160)},
    "earth":   {"name": "Earth",   "class": "Terrestrial Planet",       "color": (26, 107, 154)},
    "mars":    {"name": "Mars",    "class": "Terrestrial Planet",       "color": (193, 68, 14)},
    "jupiter": {"name": "Jupiter", "class": "Gas Giant",                "color": (200, 139, 58)},
    "saturn":  {"name": "Saturn",  "class": "Gas Giant",                "color": (228, 209, 145)},
    "uranus":  {"name": "Uranus",  "class": "Ice Giant",                "color": (125, 232, 232)},
    "neptune": {"name": "Neptune", "class": "Ice Giant",                "color": (63, 84, 186)},
    "moon":    {"name": "Moon",    "class": "Natural Satellite",        "color": (176, 176, 176)},
}


class HUD:
    def __init__(self, screen: pygame.Surface):
        self.screen = screen
        pygame.font.init()
        try:
            self.font_sm    = pygame.font.SysFont("Consolas", 11)
            self.font_md    = pygame.font.SysFont("Consolas", 13)
            self.font_lg    = pygame.font.SysFont("Consolas", 18)
            self.font_xl    = pygame.font.SysFont("Consolas", 24)
            self.font_title = pygame.font.SysFont("Consolas", 20, bold=True)
        except Exception:
            self.font_sm    = pygame.font.Font(None, 14)
            self.font_md    = pygame.font.Font(None, 16)
            self.font_lg    = pygame.font.Font(None, 20)
            self.font_xl    = pygame.font.Font(None, 26)
            self.font_title = pygame.font.Font(None, 22)

    def _draw_panel(self, surf, x, y, w, h, alpha=220):
        panel = pygame.Surface((w, h), pygame.SRCALPHA)
        panel.fill((5, 10, 20, alpha))
        pygame.draw.rect(panel, (255, 255, 255, 18), (0, 0, w, h), 1, border_radius=8)
        surf.blit(panel, (x, y))

    def _text(self, surf, text, x, y, color, font=None):
        font = font or self.font_md
        s = font.render(text, True, color[:3] if len(color) > 3 else color)
        surf.blit(s, (x, y))

    def draw(self, state: dict):
        w, h = self.screen.get_size()
        surf = pygame.Surface((w, h), pygame.SRCALPHA)

        self._draw_navbar(surf, w, state)
        self._draw_sidebar(surf, h, state)
        if state.get("selected") and not state.get("compare_mode"):
            self._draw_info_panel(surf, w, h, state)
        if state.get("compare_mode"):
            self._draw_compare_hint(surf, w, h)
        self._draw_viewport_hud(surf, w, h, state)

        self.screen.blit(surf, (0, 0))

    def _draw_navbar(self, surf, w, state):
        self._draw_panel(surf, 0, 0, w, 46, 240)

        # Brand
        self._text(surf, "SOLAR SYSTEM", 16, 10, TEXT_PRIMARY, self.font_title)
        self._text(surf, "SIMULATOR", 16, 28, ACCENT_TEAL, self.font_sm)

        # Nav tabs
        tabs = ["Home", "Simulation", "Compare", "Learn", "About"]
        cx = w // 2 - 150
        for t in tabs:
            col = ACCENT_TEAL if t == "Simulation" else TEXT_SECONDARY
            self._text(surf, t, cx, 15, col)
            cx += 70

        # Status
        status_color = ACCENT_GOLD if state.get("paused") else ACCENT_TEAL
        status_text  = "PAUSED" if state.get("paused") else "RUNNING"
        pygame.draw.circle(surf, status_color, (w - 200, 23), 4)
        self._text(surf, status_text, w - 190, 15, status_color, self.font_sm)
        self._text(surf, f"x{state.get('speed', 50)}", w - 130, 15, TEXT_SECONDARY, self.font_sm)
        self._text(surf, f"{state.get('fps', 0)} FPS", w - 80, 15, TEXT_SECONDARY, self.font_sm)

    def _draw_sidebar(self, surf, h, state):
        sw = 210
        self._draw_panel(surf, 0, 46, sw, h - 46, 230)

        y = 56
        self._text(surf, "CONTROLS", 16, y, TEXT_MUTED, self.font_sm)
        y += 20

        btn_col = ACCENT_GOLD if state.get("paused") else ACCENT_TEAL
        pygame.draw.rect(surf, (*btn_col, 30), (10, y, sw - 20, 28), border_radius=6)
        pygame.draw.rect(surf, (*btn_col, 90), (10, y, sw - 20, 28), 1, border_radius=6)
        label = "RESUME [SPACE]" if state.get("paused") else "PAUSE  [SPACE]"
        self._text(surf, label, 28, y + 8, btn_col, self.font_sm)
        y += 36

        self._text(surf, "Simulation Speed", 12, y, TEXT_SECONDARY, self.font_sm)
        y += 16
        pygame.draw.rect(surf, (10, 20, 35, 180), (10, y, sw - 20, 22), border_radius=4)
        pygame.draw.rect(surf, (30, 50, 70, 60), (10, y, sw - 20, 22), 1, border_radius=4)
        self._text(surf, f"- x{state.get('speed', 50)}  +", 40, y + 5, TEXT_PRIMARY, self.font_md)
        y += 30

        controls = [
            ("R", "Reset Camera"),
            ("O", f"Orbits: {'ON' if state.get('orbits') else 'OFF'}"),
            ("+", "Zoom In"),
            ("-", "Zoom Out"),
            ("F", "Fullscreen"),
            ("C", "Compare Planets"),
        ]
        for key, action in controls:
            pygame.draw.rect(surf, (20, 35, 55, 40), (12, y + 2, 20, 16), border_radius=3)
            self._text(surf, key, 16, y + 3, TEXT_SECONDARY, self.font_sm)
            o_col = ACCENT_TEAL if action.startswith("Orbits: ON") else TEXT_SECONDARY
            self._text(surf, action, 36, y + 3, o_col, self.font_sm)
            y += 20

        y += 6
        self._text(surf, "SELECT BODY", 16, y, TEXT_MUTED, self.font_sm)
        y += 18

        PLANET_ORDER = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "moon"]
        for pid in PLANET_ORDER:
            info = PLANETS_INFO[pid]
            is_sel = state.get("selected") == pid
            if is_sel:
                pygame.draw.rect(surf, (0, 60, 50, 50), (8, y - 2, sw - 16, 20), border_radius=4)
                pygame.draw.rect(surf, (0, 150, 120, 80), (8, y - 2, sw - 16, 20), 1, border_radius=4)
            pygame.draw.circle(surf, info["color"], (22, y + 8), 7)
            col = TEXT_PRIMARY if is_sel else TEXT_SECONDARY
            self._text(surf, info["name"], 34, y + 2, col, self.font_sm)
            y += 20

        y += 8
        self._text(surf, "KEYBOARD SHORTCUTS", 16, y, TEXT_MUTED, self.font_sm)
        y += 18
        shortcuts = [("L", "Cycle Bodies"), ("↑↓", "Change Speed"), ("ESC", "Close Panel")]
        for key, act in shortcuts:
            pygame.draw.rect(surf, (20, 30, 48, 40), (12, y + 1, 28, 14), border_radius=3)
            self._text(surf, key, 14, y + 2, TEXT_SECONDARY, self.font_sm)
            self._text(surf, act, 46, y + 2, TEXT_MUTED, self.font_sm)
            y += 18

    def _draw_info_panel(self, surf, w, h, state):
        pid = state.get("selected")
        if not pid or pid not in PLANETS_INFO:
            return

        pw, ph = 290, 300
        x = w - pw - 6
        y = 54

        self._draw_panel(surf, x, y, pw, ph, 230)

        info = PLANETS_INFO[pid]
        pygame.draw.circle(surf, info["color"], (x + 28, y + 28), 18)

        self._text(surf, info["name"], x + 56, y + 12, TEXT_PRIMARY, self.font_xl)
        self._text(surf, info["class"], x + 56, y + 36, TEXT_SECONDARY, self.font_sm)

        self._text(surf, "STATISTICS", x + 14, y + 65, TEXT_MUTED, self.font_sm)
        pygame.draw.line(surf, (0, 60, 48, 100), (x + 14, y + 78), (x + pw - 14, y + 78))

        stat_data = {
            "sun":     [("Radius", "695,700 km"), ("Mass", "1.989×10³⁰ kg"), ("Type", "G-type Star"), ("Temp", "5,505°C (surface)")],
            "mercury": [("Radius", "2,439.7 km"), ("Mass", "3.285×10²³ kg"), ("Orbital Period", "87.97 days"), ("Temp", "-180 to 430°C")],
            "venus":   [("Radius", "6,051.8 km"), ("Mass", "4.867×10²⁴ kg"), ("Orbital Period", "224.7 days"), ("Temp", "465°C (avg)")],
            "earth":   [("Radius", "6,371 km"), ("Mass", "5.972×10²⁴ kg"), ("Orbital Period", "365.25 days"), ("Moons", "1 (Moon)")],
            "mars":    [("Radius", "3,389.5 km"), ("Mass", "6.390×10²³ kg"), ("Orbital Period", "686.97 days"), ("Moons", "2")],
            "jupiter": [("Radius", "69,911 km"), ("Mass", "1.898×10²⁷ kg"), ("Orbital Period", "4332.59 days"), ("Moons", "95")],
            "saturn":  [("Radius", "58,232 km"), ("Mass", "5.683×10²⁶ kg"), ("Orbital Period", "10759.22 days"), ("Moons", "146")],
            "uranus":  [("Radius", "25,362 km"), ("Mass", "8.681×10²⁵ kg"), ("Orbital Period", "30688.5 days"), ("Moons", "28")],
            "neptune": [("Radius", "24,622 km"), ("Mass", "1.024×10²⁶ kg"), ("Orbital Period", "60182 days"), ("Moons", "16")],
            "moon":    [("Radius", "1,737.4 km"), ("Mass", "7.342×10²² kg"), ("Orbital Period", "27.32 days"), ("Parent", "Earth")],
        }

        stats = stat_data.get(pid, [])
        sy = y + 86
        for label, val in stats:
            self._text(surf, label, x + 14, sy, TEXT_SECONDARY, self.font_sm)
            self._text(surf, val, x + pw - len(val) * 7 - 10, sy, TEXT_PRIMARY, self.font_sm)
            pygame.draw.line(surf, (20, 35, 50, 60), (x + 14, sy + 14), (x + pw - 14, sy + 14))
            sy += 20

        self._text(surf, "[ESC] Close", x + 14, y + ph - 20, TEXT_MUTED, self.font_sm)

    def _draw_compare_hint(self, surf, w, h):
        x, y = w // 2 - 200, h // 2 - 60
        self._draw_panel(surf, x, y, 400, 120, 220)
        self._text(surf, "COMPARE MODE", x + 150, y + 20, ACCENT_TEAL, self.font_lg)
        self._text(surf, "Press C to close compare mode", x + 90, y + 60, TEXT_SECONDARY)
        self._text(surf, "Use the browser app for full comparison", x + 60, y + 85, TEXT_MUTED, self.font_sm)

    def _draw_viewport_hud(self, surf, w, h, state):
        cx, cy = 50, h - 50
        r = 24
        pygame.draw.circle(surf, (10, 20, 35, 100), (cx, cy), r)
        pygame.draw.circle(surf, (0, 80, 60, 70), (cx, cy), r, 1)
        pygame.draw.line(surf, (*ACCENT_TEAL, 160), (cx, cy), (cx, cy - r + 4), 2)
        self._text(surf, "N", cx - 4, cy - r - 12, ACCENT_TEAL, self.font_sm)
        self._text(surf, "S", cx - 3, cy + r + 2, TEXT_MUTED, self.font_sm)
        self._text(surf, "E", cx + r + 2, cy - 5, TEXT_MUTED, self.font_sm)
        self._text(surf, "W", cx - r - 14, cy - 5, TEXT_MUTED, self.font_sm)

        self._text(surf, "Drag: Rotate  |  Right-drag: Pan  |  Scroll: Zoom", w // 2 - 150, h - 20, TEXT_MUTED, self.font_sm)
