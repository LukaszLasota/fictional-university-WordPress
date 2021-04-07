<?php get_header(); 
pageBanner(array(
  'title'=>'All programs',
  'subtitle'=>'Look around'
));
?>

  <div class="container container--narrow page-section">
  
  <ul class="link-list min-list">
  <?php
      while(have_posts()){
        the_post(); ?>

        <li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
    
        <?php }
        echo paginate_links();
  ?>
  </ul>

        

  </>

<?php get_footer(); ?>
