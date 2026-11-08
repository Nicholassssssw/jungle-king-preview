const target=new URL('./demo.html',location.href);target.search=location.search;location.replace(target.href);
