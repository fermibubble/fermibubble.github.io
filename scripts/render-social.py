"""Regenerate committed social cards after changing titles (Pillow + lxml)."""
from pathlib import Path
from lxml import html
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
for p in (root/'dist').rglob('*.html'):
 d=html.fromstring(p.read_bytes())
 targets=d.xpath('//meta[@property="og:image"]/@content')
 if not targets: continue
 title=d.xpath('//h1')[0].text_content().strip()
 im=Image.new('RGB',(1200,630),'#fbfcfe'); draw=ImageDraw.Draw(im)
 draw.rounded_rectangle((64,58,118,112),radius=12,fill='#315de8')
 draw.text((79,61),'O',font=ImageFont.truetype(font,35),fill='white')
 draw.text((138,67),'Oddly',font=ImageFont.truetype(font,31),fill='#172033')
 draw.text((64,530),'CHAITANYA MEESALA  /  ODDLY.FYI',font=ImageFont.truetype(font,19),fill='#435475')
 draw.line((64,495,1136,495),fill='#d6deed',width=2)
 size=59
 while True:
  face=ImageFont.truetype(font,size);lines=[];line=''
  for word in title.split():
   candidate=(line+' '+word).strip()
   if draw.textlength(candidate,font=face)>1060 and line: lines.append(line);line=word
   else:line=candidate
  if line:lines.append(line)
  if len(lines)*(size+14)<=280:break
  size-=2
 y=174
 for line in lines: draw.text((64,y),line,font=face,fill='#172033');y+=size+14
 target=root/targets[0].replace('https://oddly.fyi/','');target.parent.mkdir(parents=True,exist_ok=True);im.save(target,optimize=True)
print('Generated social cards')
