import math
import turtle

S = turtle.Screen()
S.bgcolor("black")
S.setup(760, 760)
S.setworldcoordinates(-330, -330, 330, 330)
S.tracer(0)

pen1 = turtle.Turtle()
pen2 = turtle.Turtle()
pen3 = turtle.Turtle()
pen4 = turtle.Turtle()

pen1.color("cyan")
pen2.color("magenta")
pen3.color("yellow")
pen4.color("lime")

for P in (pen1, pen2, pen3, pen4):
    P.speed(0)
    P.pensize(2)
    P.hideturtle()
    P.penup()

A = 0.01
B = -50

C = 5
D = -100

E = 50
F = 0

R = 100

for I in range(401):

    X = I - 200
    Y = A * X**2 + B

    if abs(Y) <= 300:
        pen1.goto(X, Y)
        pen1.pendown()
    else:
        pen1.penup()

    if I < 210:
        X = I - 150
        Y = C * math.exp(X / 20) + D

        if abs(Y) <= 300:
            pen2.goto(X, Y)
            pen2.pendown()
        else:
            pen2.penup()

    if I < 299:
        X = I + 1
        Y = E * math.log(X / 10) + F

        if abs(Y) <= 300:
            pen3.goto(X, Y)
            pen3.pendown()
        else:
            pen3.penup()

    if I <= 360:
        T = math.radians(I)
        X = R * math.cos(T)
        Y = R * math.sin(T)

        pen4.goto(X, Y)
        pen4.pendown()

    S.update()

turtle.done()
