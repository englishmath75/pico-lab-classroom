import math

for degree in [0, 30, 45, 60, 90, 180, 360]:
    radian = math.radians(degree)
    radius = 1
    arc_length = radius * radian
    print(f"{degree:3d}° | rad={radian:.6f} | s={arc_length:.6f}"
          f" | sin={math.sin(radian):.6f} | cos={math.cos(radian):.6f}")
