import turtle

colors = ["red", "green", "blue", "purple"]
turtles = []
for i in range(4):
    t = turtle.Turtle()
    t.pencolor(colors[i])
    t.left(i * 90)
    t.forward(60)
    turtles.append(t)
