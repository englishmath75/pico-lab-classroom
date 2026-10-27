import tkinter as tk
import math
import random
import time

class WarpDriveTunnel:
    def __init__(self, root):
        self.root = root
        self.root.title("Sci-Fi Hyperspace 3D Warp Tunnel")
        self.width = 1000
        self.height = 700
        self.canvas = tk.Canvas(root, width=self.width, height=self.height, bg='#020208', highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # 별 입자 데이터 생성
        self.stars = [self.reset_star() for _ in range(350)]
        self.angle = 0
        self.animate()

    def reset_star(self):
        return {
            'x': random.uniform(-self.width, self.width),
            'y': random.uniform(-self.height, self.height),
            'z': random.uniform(10, 1000),
            'color': random.choice(["#00ffff", "#ff00ff", "#00ffaa", "#ffffff", "#ffcc00"])
        }

    def animate(self):
        self.canvas.delete("all")
        cx, cy = self.width / 2, self.height / 2
        self.angle += 0.04

        # 1. 중심 3D 회전 다각형 터널 링 렌더링
        for i in range(14, 0, -1):
            z = (i * 70 + (time.time() * 250) % 70)
            scale = 400 / (z + 1)
            r = 320 * scale
            if r > 0:
                points = []
                for j in range(8):  # 8각형 터널 구조
                    a = j * (2 * math.pi / 8) + self.angle + (800 / z)
                    points.extend([cx + math.cos(a) * r, cy + math.sin(a) * r])
                
                ring_color = ["#ff0055", "#00f0ff", "#7000ff", "#ff00aa", "#00ffaa"][i % 5]
                self.canvas.create_polygon(points, outline=ring_color, fill="", width=max(1, int(3.5 * scale)))

        # 2. 고속 워프 별빛 잔상 렌더링
        for s in self.stars:
            s['z'] -= 20  # 고속 전진 속도
            if s['z'] <= 1:
                s.update(self.reset_star())
                s['z'] = 1000

            scale = 400 / s['z']
            px, py = cx + s['x'] * scale, cy + s['y'] * scale
            
            # 속도감을 위한 뒤쪽 연결 잔상 좌표
            prev_scale = 400 / (s['z'] + 40)
            prev_px, prev_py = cx + s['x'] * prev_scale, cy + s['y'] * prev_scale

            if 0 <= px <= self.width and 0 <= py <= self.height:
                w = max(1, int(4 * scale))
                self.canvas.create_line(prev_px, prev_py, px, py, fill=s['color'], width=w)

        self.root.after(16, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = WarpDriveTunnel(root)
    root.mainloop()