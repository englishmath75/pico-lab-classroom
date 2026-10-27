import pygame
import random
import math

pygame.init()
WIDTH, HEIGHT = 1000, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Game Skill VFX Particle Engine")
clock = pygame.time.Clock()

class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(2, 12)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        self.radius = random.uniform(3, 8)
        self.life = 255  # 수명 및 투명도
        self.color = random.choice([
            (255, 50, 150), (50, 200, 255), (255, 220, 50), (180, 50, 255)
        ])

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.15  # 중력 적용
        self.vx *= 0.96  # 공기 저항
        self.vy *= 0.96
        self.life -= 4.5 # 감쇠

    def draw(self, surface):
        if self.life > 0:
            # 파티클 자체 및 빛나는 후광 효과 구현
            s = pygame.Surface((self.radius * 4, self.radius * 4), pygame.SRCALPHA)
            alpha = max(0, int(self.life))
            color_with_alpha = (*self.color, alpha)
            
            # 은은한 발광 효과 원
            pygame.draw.circle(s, (*self.color, int(alpha * 0.3)), (self.radius * 2, self.radius * 2), self.radius * 2)
            # 중심 핵심 파티클
            pygame.draw.circle(s, color_with_alpha, (self.radius * 2, self.radius * 2), self.radius)
            
            surface.blit(s, (self.x - self.radius * 2, self.y - self.radius * 2), special_flags=pygame.BLEND_ADD)

particles = []
running = True

while running:
    clock.tick(60)
    screen.fill((10, 10, 18))

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN or (event.type == pygame.MOUSEMOTION and event.buttons[0]):
            mx, my = pygame.mouse.get_pos()
            for _ in range(30): # 클릭 시 30개의 입자 생성
                particles.append(Particle(mx, my))

    # 파티클 업데이트 및 렌더링
    for p in particles[:]:
        p.update()
        p.draw(screen)
        if p.life <= 0:
            particles.remove(p)

    pygame.display.flip()

pygame.quit()