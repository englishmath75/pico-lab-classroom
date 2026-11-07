import turtle

turtle.bgcolor("black")
turtle.speed(0)
turtle.pensize(2)
colors = ["red", "yellow", "green", "cyan", "blue", "magenta"]
for i in range(36):
    turtle.pencolor(colors[i % len(colors)])
    turtle.circle(100)
    turtle.left(10)
turtle.done()
