import tkinter as tk
import math

class LorenzHologram:
    def __init__(self, root):
        self.root = root
        self.root.title("Quantum Math Chaos - 3D Lorenz Attractor Hologram")
        self.width = 900
        self.height = 650
        self.canvas = tk.Canvas(root, width=self.width, height=self.height, bg='#020205', highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)

        # 로렌츠 카오스 초기 변수
        self.x, self.y, self.z = 0.1, 0.0, 0.0
        self.dt = 0.008
        self.points = []
        self.angle = 0

        self.animate()

    def animate(self):
        # 로렌츠 끌개 미분 방정식 계산 (dx/dt, dy/dt, dz/dt)
        sigma, rho, beta = 10.0, 28.0, 8.0 / 3.0
        dx = sigma * (self.y - self.x) * self.dt
        dy = (self.x * (rho - self.z) - self.y) * self.dt
        dz = (self.x * self.y - beta * self.z) * self.dt

        self.x += dx
        self.y += dy
        self.z += dz

        self.points.append((self.x, self.y, self.z))
        if len(self.points) > 1300:  # 화면에 유지할 최대 궤적 길이
            self.points.pop(0)

        self.canvas.delete("all")
        self.angle += 0.012  # Y축 3D 회전 각도

        cx, cy = self.width / 2, self.height / 2 + 50
        scale = 11.5
        cos_a, sin_a = math.cos(self.angle), math.sin(self.angle)
        
        prev_px, prev_py = None, None
        total_pts = len(self.points)

        # 3D 좌표 회전 변환 및 2D 회화식 투영
        for i, (px, py, pz) in enumerate(self.points):
            rx = px * cos_a - py * sin_a
            ry = px * sin_a + py * cos_a
            rz = pz

            screen_x = cx + rx * scale
            screen_y = cy - (rz - 25) * scale

            if prev_px is not None:
                # 궤적 생성 시간에 따른 무지개 네온 그라데이션 색상
                progress = i / total_pts
                r = int(255 * progress)
                g = int(255 * (1 - abs(progress - 0.5) * 2))
                b = int(255 * (1 - progress))
                color = f"#{r:02x}{g:02x}{b:02x}"
                
                self.canvas.create_line(prev_px, prev_py, screen_x, screen_y, fill=color, width=2)
            
            prev_px, prev_py = screen_x, screen_y

        self.root.after(15, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = LorenzHologram(root)
    root.mainloop()