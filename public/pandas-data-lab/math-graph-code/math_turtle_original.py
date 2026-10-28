# math 모듈과 반복문을 사용해 여러 수학 함수를 그리는 코드

import math
import turtle

screen = turtle.Screen()
screen.bgcolor("black")

pen = turtle.Turtle()
pen.speed(0)
pen.hideturtle()
pen.pensize(2)

# 좌표계 설정
pen.penup()
pen.goto(-300, 0)
pen.pendown()
pen.color("white")
pen.goto(300, 0)

pen.penup()
pen.goto(0, -300)
pen.pendown()
pen.goto(0, 300)

# 다항함수: y = ax^2 + b
pen.penup()
pen.color("cyan")
a, b = 0.01, -50
for x in range(-200, 201):
    y = a * (x**2) + b
    if abs(y) <= 300:
        pen.goto(x, y)
        pen.pendown()
    else:
        pen.penup()

# 지수함수: y = ae^x + b (스케일 조정)
pen.penup()
pen.color("magenta")
a, b = 5, -100
for x in range(-150, 60):
    y = a * math.exp(x / 20) + b
    if abs(y) <= 300:
        pen.goto(x, y)
        pen.pendown()
    else:
        pen.penup()

# 로그함수: y = aln(x) + b (스케일 조정)
pen.penup()
pen.color("yellow")
a, b = 50, 0
for x in range(1, 300):
    y = a * math.log(x / 10) + b
    if abs(y) <= 300:
        pen.goto(x, y)
        pen.pendown()
    else:
        pen.penup()

# 원의 방정식: x^2 + y^2 = r^2
pen.penup()
pen.color("lime")
r = 100
for angle in range(361):
    rad = math.radians(angle)
    x = r * math.cos(rad)
    y = r * math.sin(rad)
    pen.goto(x, y)
    if angle == 0:
        pen.pendown()

turtle.done()
