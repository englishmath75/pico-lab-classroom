import tkinter as tk
import math
import time

class AuroraVisualizer:
    def __init__(self, root):
        self.root = root
        self.root.title("Commercial Media Art - Organic Aurora")
        self.width = 900
        self.height = 600
        
        self.canvas = tk.Canvas(root, width=self.width, height=self.height, bg='#030308', highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        self.start_time = time.time()
        self.animate()

    def animate(self):
        self.canvas.delete("all")
        t = time.time() - self.start_time
        
        # 4개의 서로 다른 레이어 오로라 곡선 생성
        layers = [
            {"color": "#00FFCC", "amp": 60, "freq": 0.008, "speed": 1.5, "y_off": 0},
            {"color": "#7000FF", "amp": 80, "freq": 0.005, "speed": 1.0, "y_off": 30},
            {"color": "#FF007F", "amp": 50, "freq": 0.012, "speed": 2.0, "y_off": -20},
            {"color": "#007FFF", "amp": 70, "freq": 0.006, "speed": 0.8, "y_off": 10}
        ]
        
        for layer in layers:
            points = []
            # 화면 왼쪽부터 오른쪽까지 곡선 좌표 계산
            for x in range(0, self.width + 20, 20):
                # 복합 삼각함수를 통한 유기적 파동 알고리즘
                y = (self.height / 2 + layer["y_off"]) + \
                    math.sin(x * layer["freq"] + t * layer["speed"]) * layer["amp"] + \
                    math.cos(x * 0.015 - t * 1.2) * (layer["amp"] * 0.5)
                points.extend([x, y])
            
            # 다각형 바닥까지 연결하여 그라데이션 면적 표현
            points.extend([self.width, self.height, 0, self.height])
            
            # 곡선 및 면적 그리기 (선과 다각형 조합)
            self.canvas.create_polygon(points, fill=layer["color"], outline="", stipple="gray50")
            self.canvas.create_line(points[:-4], fill=layer["color"], width=3)
        
        # 30ms 마다 재귀 호출 (약 33 FPS)
        self.root.after(30, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = AuroraVisualizer(root)
    root.mainloop()
    