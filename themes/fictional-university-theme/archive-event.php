<?php get_header(); 
pageBanner(array(
  'title'=>'All Events',
  'subtitle'=>'See what is going on in our word'
));
?>

  <div class="container container--narrow page-section">
  <?php
      while(have_posts()){
        the_post(); 
        get_template_part('template-parts/content', get_post_type());
      }
        echo paginate_links();
  ?>
        <hr class='section-break'>
        <p>Lookin for past events? <br><a class='btn btn--blue' href="<?php echo site_url( '/past-events'); ?>">Go and check</a></p>

  </div>

<?php get_footer(); ?>
