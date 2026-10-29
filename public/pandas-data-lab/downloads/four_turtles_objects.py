# math 모듈과 반복문을 사용해 여러 수학 함수를 그리는 코드

import math
import turtle

screen = turtle.Screen()
screen.bgcolor("black")

pen1 = turtle.Turtle()
pen2 = turtle.Turtle()
pen3 = turtle.Turtle()
pen4 = turtle.Turtle()

pen1.speed(0)
pen1.hideturtle()
pen1.pensize(2)

pen2.speed(0)
pen2.hideturtle()
pen2.pensize(2)

pen3.speed(0)
pen3.hideturtle()
pen3.pensize(2)

pen4.speed(0)
pen4.hideturtle()
pen4.pensize(2)

# 좌표계 설정
pen1.penup()
pen1.goto(-300, 0)
pen1.pendown()
pen1.color("white")
pen1.goto(300, 0)

pen1.penup()
pen1.goto(0, -300)
pen1.pendown()
pen1.goto(0, 300)

# 다항함수: y = ax^2 + b
pen1.penup()
pen1.color("cyan")
a, b = 0.01, -50
for x in range(-200, 201):
    y = a * (x**2) + b
    if abs(y) <= 300:
        pen1.goto(x, y)
        pen1.pendown()
    else:
        pen1.penup()

# 지수함수: y = ae^x + b (스케일 조정)
pen2.penup()
pen2.color("magenta")
a, b = 5, -100
for x in range(-150, 60):
    y = a * math.exp(x / 20) + b
    if abs(y) <= 300:
        pen2.goto(x, y)
        pen2.pendown()
    else:
        pen2.penup()

# 로그함수: y = aln(x) + b (스케일 조정)
pen3.penup()
pen3.color("yellow")
a, b = 50, 0
for x in range(1, 300):
    y = a * math.log(x / 10) + b
    if abs(y) <= 300:
        pen3.goto(x, y)
        pen3.pendown()
    else:
        pen3.penup()

# 원의 방정식: x^2 + y^2 = r^2
pen4.penup()
pen4.color("lime")
r = 100
for angle in range(361):
    rad = math.radians(angle)
    x = r * math.cos(rad)
    y = r * math.sin(rad)
    pen4.goto(x, y)
    if angle == 0:
        pen4.pendown()

turtle.done()
