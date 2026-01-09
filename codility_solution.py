from typing import List
from collections import defaultdict

def count_parallel_lines(lst: List) -> int:
    """
    Zlicza liczbę par równoległych linii.
    
    Linie są równoległe jeśli mają ten sam współczynnik kierunkowy (slope).
    Dla punktów (x1, y1) i (x2, y2), slope = (y2 - y1) / (x2 - x1)
    
    Strategia:
    1. Dla każdej pary punktów oblicz współczynnik kierunkowy
    2. Grupuj linie według współczynnika
    3. Dla każdej grupy o rozmiarze n, liczba par to n*(n-1)/2
    """
    
    if len(lst) < 2:
        return 0
    
    # Słownik: współczynnik kierunkowy -> lista linii (jako krotki punktów)
    slopes = defaultdict(list)
    
    # Iteruj przez wszystkie pary punktów (wszystkie możliwe linie)
    n = len(lst)
    for i in range(n):
        for j in range(i + 1, n):
            x1, y1 = lst[i]
            x2, y2 = lst[j]
            
            # Oblicz współczynnik kierunkowy
            # Używamy ułamka w postaci nieredukowalnej (dy, dx) zamiast dzielenia
            # aby uniknąć problemów z float precision
            dx = x2 - x1
            dy = y2 - y1
            
            # Normalizacja: uczyń dx zawsze dodatnim (lub dy dla linii pionowych)
            if dx == 0:  # Linia pionowa
                slope = (1, 0) if dy > 0 else (-1, 0)
            elif dy == 0:  # Linia pozioma
                slope = (0, 1)
            else:
                # Zredukuj ułamek (GCD)
                from math import gcd
                g = gcd(abs(dy), abs(dx))
                dy, dx = dy // g, dx // g
                
                # Normalizacja: dx > 0, lub jeśli dx == 0 to dy > 0
                if dx < 0:
                    dx, dy = -dx, -dy
                
                slope = (dy, dx)
            
            # Dodaj linię do grupy o tym samym slope
            slopes[slope].append((i, j))
    
    # Zlicz pary równoległych linii
    total_pairs = 0
    for slope, lines in slopes.items():
        n = len(lines)
        if n > 1:
            # Liczba par z n elementów to n*(n-1)/2
            pairs = n * (n - 1) // 2
            total_pairs += pairs
    
    return total_pairs


# Test z przykładowymi danymi
if __name__ == "__main__":
    lst = [(1, 7), (1, 12), (1, 15), (5, 15), (6, 22), (3, 12), (10, 33), (200, 603), (200, 603)]
    
    result = count_parallel_lines(lst)
    print(f"Liczba par równoległych linii: {result}")
    
    # Debugowanie - pokaż grupy równoległych linii
    from collections import defaultdict
    from math import gcd
    
    slopes = defaultdict(list)
    n = len(lst)
    
    for i in range(n):
        for j in range(i + 1, n):
            x1, y1 = lst[i]
            x2, y2 = lst[j]
            
            dx = x2 - x1
            dy = y2 - y1
            
            if dx == 0:
                slope = (1, 0) if dy > 0 else (-1, 0)
            elif dy == 0:
                slope = (0, 1)
            else:
                g = gcd(abs(dy), abs(dx))
                dy, dx = dy // g, dx // g
                if dx < 0:
                    dx, dy = -dx, -dy
                slope = (dy, dx)
            
            slopes[slope].append(f"{lst[i]}-{lst[j]}")
    
    print("\nGrupy równoległych linii:")
    for slope, lines in slopes.items():
        if len(lines) > 1:
            print(f"Slope {slope}: {len(lines)} linii")
            for line in lines:
                print(f"  {line}")
