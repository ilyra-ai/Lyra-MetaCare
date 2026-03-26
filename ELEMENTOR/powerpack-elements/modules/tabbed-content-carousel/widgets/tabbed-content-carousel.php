<?php
namespace PowerpackElements\Modules\TabbedContentCarousel\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Modules\Gallery\Module;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Repeater;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Embed;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Tabbed Content Carousel Widget
 */
class Tabbed_Content_Carousel extends Powerpack_Widget {
    
    /**
	 * Retrieve tabbed carousel widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
    public function get_name() {
        return 'pp-tabbed-content-carousel';
    }

    /**
	 * Retrieve tabbed carousel widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
    public function get_title() {
        return esc_html__( 'Tabbed Content Carousel', 'powerpack' );
    }

    /**
	 * Retrieve tabbed carousel widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
    public function get_icon() {
        return 'ppicon-tabbed-carousel power-pack-admin-icon';
    }

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 1.3.4
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'image', 'gallery', 'carousel', 'tab', 'slider' ];
	}
    
    /**
	 * Retrieve the list of scripts the tabbed carousel widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
    public function get_script_depends() {
        return [
            'jquery-fancybox',
            'jquery-resize',
            'imagesloaded',
			'jquery-slick',
        ];
    }

    /**
	 * Retrieve the list of styles the image slider widget depended on.
	 *
	 * Used to set styles dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
    public function get_style_depends() {
        return [
            'fancybox',
            'pp-filter-animations',
        ];
    }

	/**
	 * Image filters.
	 *
	 * @access public
	 * @param boolean $inherit if inherit option required.
	 * @return array Filters.
	 */
	protected function image_filters( $inherit = false ) {

		$inherit_opt = array();

		if ( $inherit ) {
			$inherit_opt = array(
				'' => esc_html__( 'Inherit', 'powerpack' ),
			);
		}
        
        $pp_image_filters = array(
            'normal'            => esc_html__( 'Normal', 'powerpack' ),
            'filter-1977'       => esc_html__( '1977', 'powerpack' ),
            'filter-aden'       => esc_html__( 'Aden', 'powerpack' ),
            'filter-amaro'      => esc_html__( 'Amaro', 'powerpack' ),
            'filter-ashby'      => esc_html__( 'Ashby', 'powerpack' ),
            'filter-brannan'    => esc_html__( 'Brannan', 'powerpack' ),
            'filter-brooklyn'   => esc_html__( 'Brooklyn', 'powerpack' ),
            'filter-charmes'    => esc_html__( 'Charmes', 'powerpack' ),
            'filter-clarendon'  => esc_html__( 'Clarendon', 'powerpack' ),
            'filter-crema'      => esc_html__( 'Crema', 'powerpack' ),
            'filter-dogpatch'   => esc_html__( 'Dogpatch', 'powerpack' ),
            'filter-earlybird'  => esc_html__( 'Earlybird', 'powerpack' ),
            'filter-gingham'    => esc_html__( 'Gingham', 'powerpack' ),
            'filter-ginza'      => esc_html__( 'Ginza', 'powerpack' ),
            'filter-hefe'       => esc_html__( 'Hefe', 'powerpack' ),
            'filter-helena'     => esc_html__( 'Helena', 'powerpack' ),
            'filter-hudson'     => esc_html__( 'Hudson', 'powerpack' ),
            'filter-inkwell'    => esc_html__( 'Inkwell', 'powerpack' ),
            'filter-juno'       => esc_html__( 'Juno', 'powerpack' ),
            'filter-kelvin'     => esc_html__( 'Kelvin', 'powerpack' ),
            'filter-lark'       => esc_html__( 'Lark', 'powerpack' ),
            'filter-lofi'       => esc_html__( 'Lofi', 'powerpack' ),
            'filter-ludwig'     => esc_html__( 'Ludwig', 'powerpack' ),
            'filter-maven'      => esc_html__( 'Maven', 'powerpack' ),
            'filter-mayfair'    => esc_html__( 'Mayfair', 'powerpack' ),
            'filter-moon'       => esc_html__( 'Moon', 'powerpack' ),
        );

		return array_merge( $inherit_opt, $pp_image_filters );
	}

    /**
	 * Register tabbed carousel widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
    protected function register_controls() {

        /*-----------------------------------------------------------------------------------*/
        /*	CONTENT TAB
        /*-----------------------------------------------------------------------------------*/
        
        /**
         * Content Tab: Items
         */
        $this->start_controls_section(
            'section_items',
            [
                'label'                 => esc_html__( 'Items', 'powerpack' ),
            ]
        );
        
        $repeater = new Repeater();
        
        $repeater->add_control(
			'tab_label',
			[
				'label'                 => esc_html__( 'Tab Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => '',
				'placeholder'           => '',
                'dynamic'               => [
                    'active' => true
                ],
			]
		);
        
        $repeater->add_control(
			'tab_icon',
			[
				'label'                 => esc_html__( 'Tab Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICON,
				'default'               => '',
			]
		);
        
        $repeater->add_control(
			'content_type',
			[
                'label'					=> esc_html__( 'Content Type', 'powerpack' ),
                'type'					=> Controls_Manager::SELECT,
                'default'				=> 'text',
                'options'				=> [
                    'text'			=> esc_html__( 'Text', 'powerpack' ),
                    'image'			=> esc_html__( 'Image', 'powerpack' ),
                    'video'			=> esc_html__( 'Video', 'powerpack' ),
                    'section'       => esc_html__( 'Saved Section', 'powerpack' ),
                    'widget'        => esc_html__( 'Saved Widget', 'powerpack' ),
                    'template'      => esc_html__( 'Saved Page Template', 'powerpack' ),
                ],
			]
		);

		$repeater->add_control(
			'video_source',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'youtube',
				'options'               => [
					'youtube'		=> esc_html__( 'YouTube', 'powerpack' ),
					'vimeo'			=> esc_html__( 'Vimeo', 'powerpack' ),
					'dailymotion'	=> esc_html__( 'Dailymotion', 'powerpack' ),
				],
				'condition'             => [
					'content_type'	=> 'video',
				],
			]
		);

		$repeater->add_control(
			'youtube_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your YouTube URL', 'powerpack' ),
				'default'               => 'https://www.youtube.com/watch?v=9uOETcuFjbE',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'content_type'	=> 'video',
					'video_source'	=> 'youtube',
				],
			]
		);

		$repeater->add_control(
			'vimeo_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your Vimeo URL', 'powerpack' ),
				'default'               => 'https://vimeo.com/235215203',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'content_type'	=> 'video',
					'video_source'	=> 'vimeo',
				],
			]
		);

		$repeater->add_control(
			'dailymotion_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your Dailymotion URL', 'powerpack' ),
				'default'               => 'https://www.dailymotion.com/video/x6tqhqb',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'content_type'	=> 'video',
					'video_source'	=> 'dailymotion',
				],
			]
		);

		$repeater->add_control(
			'thumbnail_size',
			[
				'label'                 => esc_html__( 'Thumbnail Size', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'maxresdefault',
				'options'               => [
					'maxresdefault' => esc_html__( 'Maximum Resolution', 'powerpack' ),
                    'hqdefault'     => esc_html__( 'High Quality', 'powerpack' ),
                    'mqdefault'     => esc_html__( 'Medium Quality', 'powerpack' ),
                    'sddefault'     => esc_html__( 'Standard Quality', 'powerpack' ),
				],
				'condition'             => [
					'video_source'	=> 'video',
					'content_type'	=> 'youtube',
				],
			]
		);

		$repeater->add_control(
			'custom_thumbnail',
			[
				'label'                 => esc_html__( 'Custom Thumbnail', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'condition'             => [
					'content_type'	=> 'video',
				],
			]
		);
        
        $repeater->add_control(
			'custom_image',
            [
                'label'                 => esc_html__( 'Image', 'powerpack' ),
                'type'                  => Controls_Manager::MEDIA,
                'default'               => [
                    'url' => Utils::get_placeholder_image_src(),
                ],
				'condition'             => [
					'content_type'		=> 'video',
					'custom_thumbnail'	=> 'yes',
				],
            ]
		);
        
        $repeater->add_control(
			'tab_text',
            [
                'label'					=> esc_html__( 'Text', 'powerpack' ),
                'type'					=> Controls_Manager::WYSIWYG,
                'default'				=> esc_html__( 'I am tab content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
                'condition'				=> [
                    'content_type' => 'text',
                ],
            ]
		);
        
        $repeater->add_control(
			'image',
            [
                'label'					=> esc_html__( 'Image', 'powerpack' ),
                'type'					=> Controls_Manager::MEDIA,
                'default'				=> [
                    'url' => Utils::get_placeholder_image_src(),
                ],
                'condition'				=> [
                    'content_type' => 'image',
                ],
            ]
		);
        
        $repeater->add_group_control(
            Group_Control_Image_Size::get_type(),
            [
                'name'                  => 'image',
                'label'                 => esc_html__( 'Image Size', 'powerpack' ),
                'default'               => 'large',
                'exclude'               => [ 'custom' ],
                'condition'				=> [
                    'content_type' => 'image',
                ],
            ]
        );
        
        $repeater->add_control(
			'saved_widget',
            [
                'label'                 => esc_html__( 'Choose Widget', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'options'               => $this->get_page_template_options( 'widget' ),
                'default'               => '-1',
                'condition'             => [
                    'content_type'	=> 'widget',
                ],
            ]
		);
        
        $repeater->add_control(
			'saved_section',
            [
                'label'                 => esc_html__( 'Choose Section', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'options'               => $this->get_page_template_options( 'section' ),
                'default'               => '-1',
                'condition'             => [
                    'content_type'	=> 'section',
                ],
            ]
		);
        
        $repeater->add_control(
			'templates',
            [
                'label'                 => esc_html__( 'Choose Template', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'options'               => $this->get_page_template_options( 'page' ),
                'default'               => '-1',
                'condition'             => [
                    'content_type'	=> 'template',
                ],
            ]
		);
        
        $this->add_control(
            'tabbed_items',
            [
                'label'                 => '',
                'type'                  => Controls_Manager::REPEATER,
				'default'     => [
					[
						'tab_label'     => esc_html__( 'Tab 1', 'powerpack' ),
						'content_type'     => 'text',
						'tab_text' => esc_html__( 'I am tab 1 content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					],
					[
						'tab_label'     => esc_html__( 'Tab 2', 'powerpack' ),
						'content_type'     => 'text',
						'tab_text' => esc_html__( 'I am tab 2 content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					],
					[
						'tab_label'     => esc_html__( 'Tab 3', 'powerpack' ),
						'content_type'     => 'text',
						'tab_text' => esc_html__( 'I am tab 3 content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					],
				],
                'fields'                => $repeater->get_controls(),
                'title_field'           => '{{tab_label}}',
            ]
        );

        $this->end_controls_section();

        /**
         * Content Tab: General Settings
         */
        $this->start_controls_section(
            'section_general_settings',
            [
                'label'                 => esc_html__( 'General Settings', 'powerpack' ),
            ]
        );

		$slides_per_view = range( 1, 10 );
		$slides_per_view = array_combine( $slides_per_view, $slides_per_view );

		$this->add_responsive_control(
			'slides_per_view',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Slides Per View', 'powerpack' ),
				'options'               => $slides_per_view,
				'default'               => '3',
				'tablet_default'        => '2',
				'mobile_default'        => '2',
				'frontend_available'    => true,
			]
		);

		$this->add_responsive_control(
			'slides_to_scroll',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Slides to Scroll', 'powerpack' ),
				'description'           => esc_html__( 'Set how many slides are scrolled per swipe.', 'powerpack' ),
				'options'               => $slides_per_view,
				'default'               => 1,
				'tablet_default'        => 1,
				'mobile_default'        => 1,
				'frontend_available'    => true,
				'condition'             => [
					'center_mode!' => 'yes',
				],
			]
		);

        $this->add_control(
            'equal_height',
            [
                'label'                 => esc_html__( 'Equal Height', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'no',
                'options'               => [
                    'yes'	=> esc_html__( 'Yes', 'powerpack' ),
                    'no'	=> esc_html__( 'No', 'powerpack' ),
                ],
                'separator'				=> 'before',
				'frontend_available'    => true,
            ]
        );

        $this->end_controls_section();

        /**
         * Content Tab: Image Settings
         */
        $this->start_controls_section(
            'section_image_settings',
            [
                'label'                 => esc_html__( 'Image Settings', 'powerpack' ),
            ]
        );

        $this->add_control(
            'caption',
            [
                'label'                 => esc_html__( 'Caption', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'show',
                'options'               => [
                    'show'  => esc_html__( 'Show', 'powerpack' ),
                    'hide' 	=> esc_html__( 'Hide', 'powerpack' ),
                ],
            ]
        );

        $this->add_control(
            'caption_type',
            [
                'label'                 => esc_html__( 'Caption Type', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'caption',
                'options'               => [
                    'title' 		=> esc_html__( 'Title', 'powerpack' ),
                    'caption' 		=> esc_html__( 'Caption', 'powerpack' ),
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_position',
            [
                'label'                 => esc_html__( 'Caption Position', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'over_image',
                'options'               => [
                    'over_image'    => esc_html__( 'Over Image', 'powerpack' ),
                    'below_image' 	=> esc_html__( 'Below Image', 'powerpack' ),
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->end_controls_section();

        /**
         * Content Tab: Video Settings
         */
        $this->start_controls_section(
            'section_video_settings',
            [
                'label'                 => esc_html__( 'Video Settings', 'powerpack' ),
            ]
        );

		$this->add_control(
			'aspect_ratio',
			[
				'label'                 => esc_html__( 'Aspect Ratio', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'169'  => '16:9',
					'219'  => '21:9',
					'43'   => '4:3',
					'32'   => '3:2',
				],
				'default'               => '169',
				'prefix_class'          => 'elementor-aspect-ratio-',
				'frontend_available'    => true,
			]
		);
        
        $this->add_control(
            'mute',
            [
                'label'                 => esc_html__( 'Mute', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => '',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
				'frontend_available'    => true,
            ]
        );

        $this->add_control(
            'click_action',
            [
                'label'                 => esc_html__( 'Click Action', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'inline',
                'options'               => [
                    'inline'    => esc_html__( 'Play Inline', 'powerpack' ),
                    'lightbox'  => esc_html__( 'Play in Lightbox', 'powerpack' ),
                ],
            ]
        );
        
        $this->add_control(
            'play_icon_heading',
            [
                'label'                 => esc_html__( 'Play Icon', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
				'separator'				=> 'before',
            ]
        );

        $this->add_control(
            'play_icon_type',
            [
                'label'                 => esc_html__( 'Icon Type', 'powerpack' ),
				'label_block'           => false,
				'toggle'                => false,
                'type'                  => Controls_Manager::CHOOSE,
                'options'               => [
					'none'        => [
						'title'   => esc_html__( 'None', 'powerpack' ),
						'icon'    => 'eicon-ban',
					],
                    'icon'  => [
                        'title' => esc_html__( 'Icon', 'powerpack' ),
                        'icon'  => 'fa fa-info-circle',
                    ],
                    'image' => [
                        'title' => esc_html__( 'Image', 'powerpack' ),
                        'icon'  => 'eicon-image-bold',
                    ],
                ],
                'default'               => 'icon',
            ]
        );

        $this->add_control(
            'play_icon',
            [
                'label'                 => esc_html__( 'Select Icon', 'powerpack' ),
                'type'                  => Controls_Manager::ICON,
                'default'               => 'fa fa-play-circle',
                'condition'             => [
                    'play_icon_type' => 'icon',
                ],
            ]
        );

        $this->add_control(
            'play_icon_image',
            [
                'label'                 => esc_html__( 'Select Image', 'powerpack' ),
                'type'                  => Controls_Manager::MEDIA,
                'default'               => [
                    'url' => Utils::get_placeholder_image_src(),
                ],
                'condition'             => [
                    'play_icon_type' => 'image',
                ],
            ]
        );

        $this->end_controls_section();

        /**
         * Content Tab: Additional Options
         */
        $this->start_controls_section(
            'section_additional_options',
            [
                'label'                 => esc_html__( 'Additional Options', 'powerpack' ),
            ]
        );

        $this->add_control(
            'animation_speed',
            [
                'label'                 => esc_html__( 'Animation Speed', 'powerpack' ),
                'type'                  => Controls_Manager::NUMBER,
                'default'               => 600,
                'frontend_available'    => true,
            ]
        );
        
        $this->add_control(
            'infinite_loop',
            [
                'label'                 => esc_html__( 'Infinite Loop', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => 'yes',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
                'frontend_available'    => true,
            ]
        );
        
        $this->add_control(
            'autoplay',
            [
                'label'                 => esc_html__( 'Autoplay', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => 'yes',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
                'frontend_available'    => true,
                'separator'				=> 'before',
            ]
        );

        $this->add_control(
            'autoplay_speed',
            [
                'label'                 => esc_html__( 'Autoplay Speed', 'powerpack' ),
                'type'                  => Controls_Manager::NUMBER,
                'default'               => 3000,
                'frontend_available'    => true,
                'condition'             => [
                    'autoplay'  => 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'pause_on_hover',
            [
                'label'                 => esc_html__( 'Pause on Hover', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => 'yes',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
                'frontend_available'    => true,
                'condition'             => [
                    'autoplay'		=> 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'center_mode',
            [
                'label'                 => esc_html__( 'Center Mode', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => '',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
                'frontend_available'    => true,
                'separator'				=> 'before',
            ]
        );
		
		$this->add_responsive_control(
            'center_padding',
            [
                'label'                 => esc_html__( 'Center Padding', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
                    'size' => 40,
                    'unit' => 'px',
                ],
				'size_units'            => [ 'px' ],
				'range'                 => [
					'px' => [
						'max' => 500,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
                'condition'             => [
                    'center_mode'	=> 'yes',
                ],
			]
		);
        
        $this->add_control(
            'side_blur',
            [
                'label'                 => esc_html__( 'Side Blur', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => '',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
                'frontend_available'    => true,
                'condition'             => [
                    'center_mode'	=> 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'navigation_heading',
            [
                'label'                 => esc_html__( 'Navigation', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
                'separator'				=> 'before',
            ]
        );
        
        $this->add_control(
            'arrows',
            [
                'label'                 => esc_html__( 'Arrows', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => 'yes',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
				'frontend_available'    => true,
            ]
        );
        
        $this->add_control(
            'dots',
            [
                'label'                 => esc_html__( 'Dots', 'powerpack' ),
                'type'                  => Controls_Manager::SWITCHER,
                'default'               => 'no',
                'label_on'              => esc_html__( 'Yes', 'powerpack' ),
                'label_off'             => esc_html__( 'No', 'powerpack' ),
                'return_value'          => 'yes',
				'frontend_available'    => true,
            ]
        );

        $this->end_controls_section();

        /*-----------------------------------------------------------------------------------*/
        /*	STYLE TAB
        /*-----------------------------------------------------------------------------------*/

        /**
         * Style Tab: Layout
         */
        $this->start_controls_section(
            'section_layout_style',
            [
                'label'                 => esc_html__( 'Layout', 'powerpack' ),
                'tab'               => Controls_Manager::TAB_STYLE,
            ]
        );
		
		$this->add_responsive_control(
			'items_gap',
			[
				'label'                 => esc_html__( 'Items Gap', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
                    'size' => 20,
                    'unit' => 'px',
                ],
				'size_units'            => [ 'px', '%' ],
				'range'                 => [
					'px' => [
						'max' => 100,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .pp-tabbed-carousel-slide' => 'padding-left: calc({{SIZE}}{{UNIT}}/2); padding-right: calc({{SIZE}}{{UNIT}}/2);',
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-list'  => 'margin-left: calc(-{{SIZE}}{{UNIT}}/2); margin-right: calc(-{{SIZE}}{{UNIT}}/2);',
                ],
			]
		);
		
		$this->add_responsive_control(
            'items_height',
            [
                'label'                 => esc_html__( 'Height', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
                    'size' => '',
                    'unit' => 'px',
                ],
				'size_units'            => [ 'px' ],
				'range'                 => [
					'px' => [
                        'step' => 1,
                        'min'  => 100,
						'max' => 800,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .pp-tabbed-carousel-item' => 'height: {{SIZE}}{{UNIT}};',
                ],
                'condition'             => [
                    'equal_height'	=> 'no',
                ],
			]
		);
        
        $this->add_control(
            'center_slide_style_heading',
            [
                'label'                 => esc_html__( 'Center Slide', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
                'separator'				=> 'before',
                'condition'             => [
                    'center_mode'	=> 'yes',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'center_slide_box_shadow',
				'selector'          => '{{WRAPPER}} .pp-tabbed-carousel .slick-center .pp-tabbed-carousel-item',
                'condition'             => [
                    'center_mode'	=> 'yes',
                ],
			]
		);

		$this->add_responsive_control(
			'slide_padding',
			[
				'label'                 => esc_html__( 'Slide Spacing', 'powerpack' ),
				'description'			=> esc_html__( 'Add top and bottom spacing to show box shadow properly', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
                'allowed_dimensions'    => 'vertical',
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel .pp-tabbed-carousel-slide' => 'padding-top: {{TOP}}{{UNIT}}; padding-bottom: {{BOTTOM}}{{UNIT}};',
				],
                'condition'             => [
                    'center_mode'	=> 'yes',
                ],
			]
		);

        $this->end_controls_section();
        
        /**
         * Style Tab: Tabs
         */
        $this->start_controls_section(
            'section_tabs_style',
            [
                'label'                 => esc_html__( 'Tabs', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_responsive_control(
			'filter_alignment',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
                'label_block'           => true,
				'type'                  => Controls_Manager::CHOOSE,
				'default'               => 'left',
				'options'               => [
					'left'          => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'center'        => [
						'title'     => esc_html__( 'Center', 'powerpack' ),
						'icon'      => 'eicon-h-align-center',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
				],
				'selectors_dictionary'  => [
					'left'      => 'flex-start',
					'center'    => 'center',
					'right'     => 'flex-end',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters'   => 'justify-content: {{VALUE}};',
				],
			]
		);
        
        $this->add_responsive_control(
            'filters_margin_bottom',
            [
                'label'                 => esc_html__( 'Tabs Bottom Spacing', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 0,
                        'max'   => 80,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'margin-bottom: {{SIZE}}{{UNIT}};',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'filter_items_gap',
            [
                'label'                 => esc_html__( 'Items Gap', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 0,
                        'max'   => 80,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters' => 'margin-left: -{{SIZE}}{{UNIT}}; margin-right: -{{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}};',
                ],
            ]
        );
        
        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name'                  => 'filter_typography',
                'label'                 => esc_html__( 'Typography', 'powerpack' ),
                'selector'              => '{{WRAPPER}} .pp-gallery-filters',
            ]
        );

        $this->start_controls_tabs( 'tabs_filter_style' );

        $this->start_controls_tab(
            'tab_filter_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
            ]
        );

        $this->add_control(
            'filter_color_normal',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_background_color_normal',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'background-color: {{VALUE}};',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'filter_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
			]
		);

		$this->add_control(
			'filter_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'filter_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
				'placeholder'           => [
					'top'      => '',
					'right'    => '',
					'bottom'   => '',
					'left'     => '',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_filter_active',
            [
                'label'                 => esc_html__( 'Active', 'powerpack' ),
            ]
        );

        $this->add_control(
            'filter_color_active',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_background_color_active',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_border_color_active',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'border-color: {{VALUE}};',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow_active',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide',
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_filter_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
            ]
        );

        $this->add_control(
            'filter_color_hover',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_background_color_hover',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'border-color: {{VALUE}};',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow_hover',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover',
			]
		);
        
        $this->end_controls_tab();
        
        $this->end_controls_tabs();
        
        $this->add_control(
            'tab_icon_style_heading',
            [
                'label'                 => esc_html__( 'Icon', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
                'separator'				=> 'before',
            ]
        );
        
        $this->add_responsive_control(
            'tab_icons_gap',
            [
                'label'                 => esc_html__( 'Icon Spacing', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 0,
                        'max'   => 80,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => '',
                'selectors'             => [
                    '{{WRAPPER}}.pp-filter-icon-inline .pp-gallery-filters .pp-gallery-filter-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}}.pp-filter-icon-block .pp-gallery-filters .pp-gallery-filter-icon' => 'margin-bottom: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'icon_position',
            [
                'label'                 => esc_html__( 'Icon Position', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'options'               => [
                   'inline'		=> esc_html__( 'Inline', 'powerpack' ),
                   'block'		=> esc_html__( 'Block', 'powerpack' ),
                ],
                'default'               => 'inline',
				'prefix_class'          => 'pp-filter-icon-',
            ]
        );
        
        $this->end_controls_section();

        /**
         * Style Tab: Content Type: Text
         */
        $this->start_controls_section(
            'section_text_style',
            [
                'label'                 => esc_html__( 'Content Type: Text', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name'                  => 'content_text_typography',
                'label'                 => esc_html__( 'Typography', 'powerpack' ),
                'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-item-text',
            ]
        );

        $this->add_control(
            'content_background_color',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-text' => 'background-color: {{VALUE}};',
                ],
            ]
        );
        

        $this->add_control(
            'content_text_color',
            [
                'label'                 => esc_html__( 'Text Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-text' => 'color: {{VALUE}};',
                ],
            ]
        );
        
        $this->add_control(
            'content_text_align',
            [
                'label'                 => esc_html__( 'Text Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
					'justify'	=> [
						'title' => esc_html__( 'Justify', 'powerpack' ),
						'icon'  => 'eicon-text-align-justify',
					],
				],
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item-text' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'text_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item-text' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();

        /**
         * Style Tab: Content Type: Image
         */
        $this->start_controls_section(
            'section_image_style',
            [
                'label'                 => esc_html__( 'Content Type: Image', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_control(
            'image_style_heading',
            [
                'label'                 => esc_html__( 'Image', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
            ]
        );

        $this->start_controls_tabs( 'tabs_image_filter_style' );

        $this->start_controls_tab(
            'tab_image_filter_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
            ]
        );

        $this->add_control(
            'image_scale',
            [
                'label'                 => esc_html__( 'Scale', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'  => 1,
                        'max'  => 2,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-image img' => 'transform: scale({{SIZE}});',
                ],
            ]
        );

        $this->add_control(
            'image_opacity',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'max'  => 1,
                        'min'  => 0,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-image' => 'opacity: {{SIZE}}',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'thumbnail_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-item-image',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);

		$this->add_control(
			'thumbnail_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item-image' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->add_control(
            'thumbnail_filter',
            [
                'label'                 => esc_html__( 'Image Filter', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'normal',
                'options'               => $this->image_filters(),
            ]
        );
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_image_filter_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
            ]
        );

        $this->add_control(
            'thumbnail_scale_hover',
            [
                'label'                 => esc_html__( 'Scale', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'  => 1,
                        'max'  => 2,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-image:hover img' => 'transform: scale({{SIZE}});',
                ],
            ]
        );

        $this->add_control(
            'thumbnail_opacity_hover',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'max'  => 1,
                        'min'  => 0,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-image:hover' => 'opacity: {{SIZE}}',
                ],
            ]
        );

        $this->add_control(
            'thumbnail_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item-image:hover' => 'border-color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'thumbnail_hover_filter',
            [
                'label'                 => esc_html__( 'Image Filter', 'powerpack' ),
                'type'                  => Controls_Manager::SELECT,
                'default'               => 'normal',
                'options'               => $this->image_filters( true ),
            ]
        );
        
        $this->end_controls_tab();
        $this->end_controls_tabs();
        
        $this->add_control(
            'caption_style_heading',
            [
                'label'                 => esc_html__( 'Caption', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
                'separator'				=> 'before',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );
        
        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name'                  => 'caption_typography',
                'label'                 => esc_html__( 'Typography', 'powerpack' ),
                'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );
        
        $this->add_control(
			'caption_vertical_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'bottom',
				'options'               => [
					'top'          => [
						'title'    => esc_html__( 'Top', 'powerpack' ),
						'icon'     => 'eicon-v-align-top',
					],
					'middle'       => [
						'title'    => esc_html__( 'Center', 'powerpack' ),
						'icon'     => 'eicon-v-align-middle',
					],
					'bottom'       => [
						'title'    => esc_html__( 'Bottom', 'powerpack' ),
						'icon'     => 'eicon-v-align-bottom',
					],
				],
				'selectors_dictionary'  => [
					'top'          => 'flex-start',
					'middle'       => 'center',
					'bottom'       => 'flex-end',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-content'   => 'justify-content: {{VALUE}};',
				],
                'condition'             => [
                    'caption'			=> 'show',
                    'caption_position'	=> 'over_image',
                ],
			]
		);
        
        $this->add_control(
			'caption_horizontal_align',
			[
				'label'                 => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					],
					'center'           => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-h-align-center',
					],
					'right'            => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					],
					'justify'          => [
						'title' => esc_html__( 'Justify', 'powerpack' ),
						'icon'  => 'eicon-h-align-stretch',
					],
				],
				'default'               => 'left',
                'selectors_dictionary'  => [
					'left'     => 'flex-start',
					'center'   => 'center',
					'right'    => 'flex-end',
					'justify'  => 'stretch',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-content' => 'align-items: {{VALUE}};',
				],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);
        
        $this->add_control(
            'caption_text_align',
            [
                'label'                 => esc_html__( 'Text Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => 'center',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'text-align: {{VALUE}};',
				],
                'condition'             => [
                    'caption' 	               => 'show',
					'caption_horizontal_align' => 'justify',
                ]
			]
		);

		$this->add_responsive_control(
			'caption_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);

		$this->add_responsive_control(
			'caption_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);

        $this->start_controls_tabs( 'tabs_caption_style' );

        $this->start_controls_tab(
            'tab_caption_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_bg_color',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-image-caption' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_color',
            [
                'label'                 => esc_html__( 'Text Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-gallery-image-caption' => 'color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'caption_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);

		$this->add_control(
			'caption_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);
        
        $this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'caption_text_shadow',
				'label'                 => esc_html__( 'Text Shadow', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_caption_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_bg_color_hover',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-caption' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_color_hover',
            [
                'label'                 => esc_html__( 'Text Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-caption' => 'color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );

        $this->add_control(
            'caption_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-caption' => 'border-color: {{VALUE}};',
                ],
                'condition'             => [
                    'caption' 	=> 'show',
                ],
            ]
        );
        
        $this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'caption_text_shadow_hover',
				'label'                 => esc_html__( 'Text Shadow', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-caption',
                'condition'             => [
                    'caption' 	=> 'show',
                ],
			]
		);
        
        $this->end_controls_tab();
        $this->end_controls_tabs();

        $this->end_controls_section();

        /**
         * Style Tab: Link Icon
         */
        $this->start_controls_section(
            'section_link_icon_style',
            [
                'label'                 => esc_html__( 'Link Icon', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->start_controls_tabs( 'tabs_link_icon_style' );

        $this->start_controls_tab(
            'tab_link_icon_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->add_control(
            'link_icon_color',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'color: {{VALUE}};',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->add_control(
            'link_icon_bg_color',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'link_icon_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon',
                'condition'             => [
					'link_icon!'   => '',
                ]
			]
		);

		$this->add_control(
			'link_icon_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
					'link_icon!'   => '',
                ]
			]
		);
        
        $this->add_responsive_control(
            'link_icon_size',
            [
                'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 5,
                        'max'   => 100,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => [ 'px' ],
                'condition'             => [
                    'icon_type'     => 'icon',
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'font-size: {{SIZE}}{{UNIT}}',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );
        
        $this->add_control(
            'link_icon_opacity_normal',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 0,
                        'max'   => 1,
                        'step'  => 0.01,
                    ],
                ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'opacity: {{SIZE}};',
				],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

		$this->add_responsive_control(
			'link_icon_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px' ],
				'placeholder'           => [
					'top'      => '',
					'right'    => '',
					'bottom'   => '',
					'left'     => '',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item .pp-gallery-image-icon' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
					'link_icon!'   => '',
                ]
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_link_icon_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->add_control(
            'link_icon_color_hover',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-icon' => 'color: {{VALUE}};',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->add_control(
            'link_icon_bg_color_hover',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-icon' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );

        $this->add_control(
            'link_icon_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-icon' => 'border-color: {{VALUE}};',
                ],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );
        
        $this->add_control(
            'link_icon_opacity_hover',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 0,
                        'max'   => 1,
                        'step'  => 0.01,
                    ],
                ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-item:hover .pp-gallery-image-icon' => 'opacity: {{SIZE}};',
				],
                'condition'             => [
					'link_icon!'   => '',
                ]
            ]
        );
        
        $this->end_controls_tab();
        
        $this->end_controls_tabs();
        
        $this->end_controls_section();

        /**
         * Style Tab: Content Type: Video
         */
        $this->start_controls_section(
            'section_video_style',
            [
                'label'                 => esc_html__( 'Content Type: Video', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_control(
            'play_icon_style_heading',
            [
                'label'                 => esc_html__( 'Play Icon', 'powerpack' ),
                'type'                  => Controls_Manager::HEADING,
                'separator'				=> 'after',
            ]
        );

        $this->add_responsive_control(
            'play_icon_size',
            [
                'label'                 => esc_html__( 'Size', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min' => 10,
                        'max' => 400,
                    ],
                ],
                'default'               => [
                    'size' => 80,
                    'unit' => 'px',
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-video-play-icon' => 'font-size: {{SIZE}}{{UNIT}}; line-height: {{SIZE}}{{UNIT}}; width: {{SIZE}}{{UNIT}};',
                ],
                'condition'             => [
                    'play_icon_type!'   => 'none',
                ],
            ]
        );

		$this->add_control(
			'play_icon_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-play-icon img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'play_icon_type'    => 'image',
                ],
			]
		);

        $this->start_controls_tabs( 'tabs_play_icon_style' );

        $this->start_controls_tab(
            'tab_play_icon_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_control(
            'play_icon_color',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'selectors'             => [
                    '{{WRAPPER}} .pp-video-play-icon' => 'color: {{VALUE}}',
                ],
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Text_Shadow::get_type(),
            [
                'name'                  => 'play_icon_text_shadow',
                'label'                 => esc_html__( 'Shadow', 'powerpack' ),
                'selector'              => '{{WRAPPER}} .pp-video-play-icon',
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_control(
            'play_icon_opacity',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'max'  => 1,
                        'min'  => 0,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-video-play-icon' => 'opacity: {{SIZE}}',
                ],
            ]
        );

        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_play_icon_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_control(
            'play_icon_hover_color',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'selectors'             => [
                    '{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon' => 'color: {{VALUE}}',
                ],
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Text_Shadow::get_type(),
            [
                'name'                  => 'play_icon_hover_text_shadow',
                'selector'              => '{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon',
                'condition'             => [
                    'play_icon_type'    => 'icon',
                    'play_icon!'        => '',
                ],
            ]
        );

        $this->add_control(
            'play_icon_hover_opacity',
            [
                'label'                 => esc_html__( 'Opacity', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'max'  => 1,
                        'min'  => 0,
                        'step' => 0.01,
                    ],
                ],
                'selectors'             => [
                    '{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon' => 'opacity: {{SIZE}}',
                ],
            ]
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();
        
        $this->end_controls_section();

        /**
         * Style Tab: Arrows
         */
        $this->start_controls_section(
            'section_arrows_style',
            [
                'label'                 => esc_html__( 'Arrows', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );
        
        $this->add_control(
			'arrow',
			[
				'label'                 => esc_html__( 'Choose Arrow', 'powerpack' ),
				'type'                  => Controls_Manager::ICON,
				'include'               => [
					'fa fa-angle-right',
                    'fa fa-angle-double-right',
                    'fa fa-chevron-right',
                    'fa fa-chevron-circle-right',
                    'fa fa-arrow-right',
                    'fa fa-long-arrow-right',
                    'fa fa-caret-right',
                    'fa fa-caret-square-o-right',
                    'fa fa-arrow-circle-right',
                    'fa fa-arrow-circle-o-right',
                    'fa fa-toggle-right',
                    'fa fa-hand-o-right',
				],
				'default'               => 'fa fa-angle-right',
				'frontend_available'    => true,
                'condition'             => [
                    'arrows'        => 'yes',
                ],
			]
		);
        
        $this->add_responsive_control(
            'arrows_size',
            [
                'label'                 => esc_html__( 'Arrows Size', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'default'               => [ 'size' => '22' ],
                'range'                 => [
                    'px' => [
                        'min'   => 15,
                        'max'   => 100,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => [ 'px' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'font-size: {{SIZE}}{{UNIT}}; line-height: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}}; width: {{SIZE}}{{UNIT}};',
				],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'arrows_horizontal_align',
            [
                'label'                 => esc_html__( 'Horizontal Align', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => -100,
                        'max'   => 50,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => [ 'px' ],
				'selectors'         => [
					'{{WRAPPER}} .pp-arrow-next' => 'right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-arrow-prev' => 'left: {{SIZE}}{{UNIT}};',
				],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'arrows_vertical_align',
            [
                'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    '%' => [
                        'min'   => -100,
                        'max'   => 50,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => [ '%' ],
				'selectors'         => [
					'{{WRAPPER}} .pp-slider-arrow' => 'top: {{SIZE}}%; transform: translateY(-{{SIZE}}%);',
				],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->start_controls_tabs( 'tabs_arrows_style' );

        $this->start_controls_tab(
            'tab_arrows_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->add_control(
            'arrows_bg_color_normal',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-slider-arrow' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->add_control(
            'arrows_color_normal',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-slider-arrow' => 'color: {{VALUE}};',
                ],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'arrows_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-slider-arrow',
                'condition'             => [
                    'arrows'        => 'yes',
                ],
			]
		);

		$this->add_control(
			'arrows_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_arrows_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->add_control(
            'arrows_bg_color_hover',
            [
                'label'                 => esc_html__( 'Background Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-slider-arrow:hover' => 'background-color: {{VALUE}};',
                ],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->add_control(
            'arrows_color_hover',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-slider-arrow:hover' => 'color: {{VALUE}};',
                ],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );

        $this->add_control(
            'arrows_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-slider-arrow:hover' => 'border-color: {{VALUE}};',
                ],
                'condition'             => [
                    'arrows'        => 'yes',
                ],
            ]
        );
        
        $this->end_controls_tab();
        
        $this->end_controls_tabs();

		$this->add_responsive_control(
			'arrows_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'separator'             => 'before',
                'condition'             => [
                    'arrows'        => 'yes',
                ],
			]
		);
        
        $this->end_controls_section();
        
        /**
         * Style Tab: Dots
         */
        $this->start_controls_section(
            'section_dots_style',
            [
                'label'                 => esc_html__( 'Dots', 'powerpack' ),
                'tab'                   => Controls_Manager::TAB_STYLE,
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'dots_size',
            [
                'label'                 => esc_html__( 'Size', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 2,
                        'max'   => 40,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li button' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'dots_spacing',
            [
                'label'                 => esc_html__( 'Spacing', 'powerpack' ),
                'type'                  => Controls_Manager::SLIDER,
                'range'                 => [
                    'px' => [
                        'min'   => 1,
                        'max'   => 30,
                        'step'  => 1,
                    ],
                ],
                'size_units'            => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

        $this->start_controls_tabs( 'tabs_dots_style' );

        $this->start_controls_tab(
            'tab_dots_normal',
            [
                'label'                 => esc_html__( 'Normal', 'powerpack' ),
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

        $this->add_control(
            'dots_color_normal',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li' => 'background: {{VALUE}};',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

        $this->add_control(
            'active_dot_color_normal',
            [
                'label'                 => esc_html__( 'Active Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li.slick-active' => 'background: {{VALUE}};',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'dots_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li',
                'condition'             => [
                    'dots'      => 'yes',
                ],
			]
		);

		$this->add_control(
			'dots_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel .slick-dots li' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'dots'      => 'yes',
                ],
			]
		);

		$this->add_responsive_control(
			'dots_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', '%' ],
                'allowed_dimensions'    => 'vertical',
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel .slick-dots' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
                'condition'             => [
                    'dots'      => 'yes',
                ],
			]
		);
        
        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_dots_hover',
            [
                'label'                 => esc_html__( 'Hover', 'powerpack' ),
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

        $this->add_control(
            'dots_color_hover',
            [
                'label'                 => esc_html__( 'Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li:hover' => 'background: {{VALUE}};',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );

        $this->add_control(
            'dots_border_color_hover',
            [
                'label'                 => esc_html__( 'Border Color', 'powerpack' ),
                'type'                  => Controls_Manager::COLOR,
                'default'               => '',
                'selectors'             => [
                    '{{WRAPPER}} .pp-tabbed-carousel .slick-dots li:hover' => 'border-color: {{VALUE}};',
                ],
                'condition'             => [
                    'dots'      => 'yes',
                ],
            ]
        );
        
        $this->end_controls_tab();
        
        $this->end_controls_tabs();
        
        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        
        $classes = [
            'pp-tabbed-carousel',
            'pp-slick-slider',
        ];
            
        if ( $settings['caption_position'] == 'over_image' ) {
            $classes[] = 'pp-gallery-caption-over-image';
        }
            
        if ( $settings['center_mode'] == 'yes' ) {
            $classes[] = 'pp-slick-center-mode';
        }
            
        if ( ( $settings['center_mode'] && $settings['side_blur'] ) == 'yes' ) {
            $classes[] = 'pp-carousel-side-blur';
        }
            
        if ( $settings['thumbnail_filter'] != '' ) {
            $classes[] = 'pp-ins-' . $settings['thumbnail_filter'];
        }
            
        if ( $settings['thumbnail_hover_filter'] != '' ) {
            $classes[] = 'pp-ins-hover-' . $settings['thumbnail_hover_filter'];
        }
        
		$this->add_render_attribute( 'carousel', [
            'class'			=> $classes,
            'id'			=> 'pp-tabbed-gallery-' . $this->get_id(),
            'data-action'	=> $settings['click_action'],
        ] );
		
		$pp_gallery_settings = [];

		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			$pp_gallery_settings['post_id'] = \Elementor\Plugin::$instance->editor->get_post_id();
		} else {
			$pp_gallery_settings['post_id'] = get_the_ID();
		}

		$pp_gallery_settings['widget_id'] = $this->get_id();
        
        $this->add_render_attribute( 'carousel', 'data-settings', wp_json_encode( $pp_gallery_settings ) );
        
        $this->slider_settings();
        ?>
        <div class="pp-tabbed-gallery-container">
            <div class="pp-tabbed-gallery-wrapper">
                <?php $this->render_filters(); ?>
                <div <?php $this->print_render_attribute_string( 'carousel' ); ?>>
                    <?php $this->render_gallery_items(); ?>
                </div>
            </div>
        </div>
        <?php
    }

	/**
	 * Carousel Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
        $settings = $this->get_settings();

        $slides_to_show          = ( isset( $settings['slides_per_view'] ) && $settings['slides_per_view'] !== '' ) ? absint( $settings['slides_per_view'] ) : 3;
        $slides_to_show_tablet   = ( isset( $settings['slides_per_view_tablet'] ) && $settings['slides_per_view_tablet'] !== '' ) ? absint( $settings['slides_per_view_tablet'] ) : 2;
        $slides_to_show_mobile   = ( isset( $settings['slides_per_view_mobile'] ) && $settings['slides_per_view_mobile'] !== '' ) ? absint( $settings['slides_per_view_mobile'] ) : 2;
        $slides_to_scroll        = ( isset( $settings['slides_to_scroll'] ) && $settings['slides_to_scroll'] !== '' ) ? absint( $settings['slides_to_scroll'] ) : 1;
        $slides_to_scroll_tablet = ( isset( $settings['slides_to_scroll_tablet'] ) && $settings['slides_to_scroll_tablet'] !== '' ) ? absint( $settings['slides_to_scroll_tablet'] ) : 1;
        $slides_to_scroll_mobile = ( isset( $settings['slides_to_scroll_mobile'] ) && $settings['slides_to_scroll_mobile'] !== '' ) ? absint( $settings['slides_to_scroll_mobile'] ) : 1;
        
        $slider_options = [
            'slidesToShow'           => $slides_to_show,
            'slidesToScroll'         => $slides_to_scroll,
            'autoplay'               => ( $settings['autoplay'] === 'yes' ),
            'autoplaySpeed'          => ( $settings['autoplay_speed'] !== '' ) ? $settings['autoplay_speed'] : 3000,
            'arrows'                 => ( $settings['arrows'] === 'yes' ),
            'dots'                   => ( $settings['dots'] === 'yes' ),
            'speed'                  => ( $settings['animation_speed'] !== '' ) ? $settings['animation_speed'] : 600,
            'infinite'               => ( $settings['infinite_loop'] === 'yes' ),
            'pauseOnHover'           => ( $settings['pause_on_hover'] === 'yes' ),
        ];

        if ( $settings['arrows'] == 'yes' ) {
            if ( $settings['arrow'] ) {
                $pa_next_arrow = $settings['arrow'];
                $pa_prev_arrow = str_replace("right","left",$settings['arrow']);
            }
            else {
                $pa_next_arrow = 'fa fa-angle-right';
                $pa_prev_arrow = 'fa fa-angle-left';
            }

            $slider_options['prevArrow'] = '<div class="pp-slider-arrow pp-arrow pp-arrow-prev"><i class="' . $pa_prev_arrow . '"></i></div>';
            $slider_options['nextArrow'] = '<div class="pp-slider-arrow pp-arrow pp-arrow-next"><i class="' . $pa_next_arrow . '"></i></div>';
        }

        if ( $settings['center_mode'] == 'yes' ) {
			$center_mode = true;
			$center_padding        = ( isset( $settings['center_padding']['size'] ) && $settings['center_padding']['size'] !== '' ) ? $settings['center_padding']['size'] . 'px' : '0px';
			$center_padding_tablet = ( isset( $settings['center_padding_tablet']['size'] ) && $settings['center_padding_tablet']['size'] !== '' ) ? $settings['center_padding_tablet']['size'] . 'px' : '0px';
			$center_padding_mobile = ( isset( $settings['center_padding_mobile']['size'] ) && $settings['center_padding_mobile']['size'] !== '' ) ? $settings['center_padding_mobile']['size'] . 'px' : '0px';
			
            $slider_options['centerMode'] = $center_mode;
            $slider_options['centerPadding'] = $center_padding;
        } else {
			$center_mode = false;
			$center_padding_tablet = '0px';
			$center_padding_mobile = '0px';
		}
		
		$elementor_bp_tablet	= get_option( 'elementor_viewport_lg' );
		$elementor_bp_mobile	= get_option( 'elementor_viewport_md' );
		$bp_tablet				= !empty($elementor_bp_tablet) ? $elementor_bp_tablet : 1025;
		$bp_mobile				= !empty($elementor_bp_mobile) ? $elementor_bp_mobile : 768;

        $slider_options['responsive'] = [
            [
                'breakpoint' => $bp_tablet,
                'settings' => [
                    'slidesToShow'      => $slides_to_show_tablet,
                    'slidesToScroll'    => $slides_to_scroll_tablet,
                    'centerMode'		=> $center_mode,
                    'centerPadding'		=> $center_padding_tablet,
                ],
            ],
            [
                'breakpoint' => $bp_mobile,
                'settings' => [
                    'slidesToShow'      => $slides_to_show_mobile,
                    'slidesToScroll'    => $slides_to_scroll_mobile,
                    'centerMode'		=> $center_mode,
                    'centerPadding'		=> $center_padding_mobile,
                ]
            ]
        ];

        $this->add_render_attribute(
            'carousel',
            [
                'data-slider-settings' => wp_json_encode( $slider_options ),
            ]
        );
    }
    
	protected function render_filters() {
		$settings = $this->get_settings_for_display();

        $gallery	= $settings['tabbed_items'];
        ?>
        <div class="pp-gallery-filters pp-tabbed-carousel-filters">
            <?php
                foreach ( $gallery as $index => $item ) {
                $tab_label = $item['tab_label'];

                if ( empty( $tab_label ) ) {
                    $tab_label = __('Tab ', 'powerpack');
                    $tab_label .= ( $index + 1 );
                }
                ?>
                <div class="pp-gallery-filter" data-index=<?php echo $index; ?>>
					<?php if ( $item['tab_icon'] ) { ?>
						<span class="pp-gallery-filter-icon <?php echo $item['tab_icon']; ?>"></span>
					<?php } ?>
					<span class="pp-gallery-filter-label">
						<?php echo $tab_label; ?>
					</span>
				</div>
            <?php } ?>
        </div>
        <?php
	}
	
	protected function render_gallery_items() {
		$settings 		= $this->get_settings_for_display();
		$count 			= 0;
		$gallery		= $settings['tabbed_items'];

		foreach ( $gallery as $index => $item ) {
            $pp_grid_item_key = $this->get_repeater_setting_key( 'gallery_item', 'tabbed_items', $count );
            $pp_caption_key = $this->get_repeater_setting_key( 'image_caption', 'tabbed_items', $count );

            $this->add_render_attribute( $pp_grid_item_key, 'class', [
				'pp-tabbed-carousel-item',
				'pp-tabbed-carousel-item-' . $item['content_type'],
				'pp-ins-filter-target'
			] );
			
			$this->add_render_attribute( $pp_caption_key, 'class', 'pp-gallery-image-content' );
			
			if ( $settings['caption_position'] == 'over_image' ) {
				$this->add_render_attribute( $pp_caption_key, 'class', 'pp-gallery-image-over-content' );
			}
			?>
			<div class="pp-tabbed-carousel-slide pp-ins-filter-hover">
				<div <?php $this->print_render_attribute_string( $pp_grid_item_key ); ?>>
					<?php
						if ( 'text' == $item['content_type'] ) {

							echo $this->parse_text_editor( $item['tab_text'] );

						} elseif ( 'image' == $item['content_type'] && $item['image']['url'] != '' ) {

							echo Group_Control_Image_Size::get_attachment_image_html( $item, 'image', 'image' );
							
							if ( $settings['caption'] == 'show' ) {
								?>
								<div <?php $this->print_render_attribute_string( $pp_caption_key ); ?>>
									<?php
									echo $this->render_image_caption( $item['image']['id'] );
									?>
								</div>
								<?php
							}

						} elseif ( 'video' == $item['content_type'] ) {
							
							$video_url_src = '';
							$thumb_size = '';
							if ( $item['video_source'] == 'youtube' ) {
								$video_url_src = $item['youtube_url'];
								$thumb_size = $item['thumbnail_size'];
							} elseif ( $item['video_source'] == 'vimeo' ) {
								$video_url_src = $item['vimeo_url'];
							} elseif ( $item['video_source'] == 'dailymotion' ) {
								$video_url_src = $item['dailymotion_url'];
							}

							$this->add_render_attribute( 'video-container' . $index, 'class', ['pp-video-container', 'elementor-fit-aspect-ratio'] );
							$this->add_render_attribute( 'video-play' . $index, 'class', 'pp-video-play' );

							if ( $settings['click_action'] == 'inline' ) {
								$embed_params = $this->get_embed_params( $item );
								$video_url = Embed::get_embed_url( $video_url_src, $embed_params, [] );

								$this->add_render_attribute( 'video-play' . $index, 'data-src', $video_url );
							} else {
								$video_url = $video_url_src;

								$this->add_render_attribute( 'video-play' . $index, 'data-fancybox', 'video-gallery-' . $this->get_id() );
							}

							$this->add_render_attribute( 'video-play' . $index, 'href', $video_url );
							?>
							<div <?php $this->print_render_attribute_string( 'video-container' . $index ); ?>>
								<div <?php $this->print_render_attribute_string( 'video-play' . $index ); ?>>
									<div class="pp-video-player">
										<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $item, $thumb_size ) ); ?>">
										<?php $this->render_play_icon(); ?>
									</div>
								</div>
							</div>
							<?php

						} elseif ( $item['content_type'] == 'section' && !empty( $item['saved_section'] ) ) {

							if ( 'publish' === get_post_status( $item['saved_section'] ) ) {
							    echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['saved_section'] );
                            }

						} elseif ( $item['content_type'] == 'template' && !empty( $item['templates'] ) ) {

							if ( 'publish' === get_post_status( $item['templates'] ) ) {
							    echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['templates'] );
                            }

						} elseif ( $item['content_type'] == 'widget' && !empty( $item['saved_widget'] ) ) {

							if ( 'publish' === get_post_status( $item['saved_widget'] ) ) {
							    echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['saved_widget'] );
                            }

						}
					?>
				</div>
			</div><?php
			$count++;
		}
	}
    
    protected function render_image_caption( $id ) {
        $settings = $this->get_settings_for_display();
        
        if ( $settings['caption'] == 'hide' ) {
			return '';
		}
        
        $caption_type = $this->get_settings( 'caption_type' );
        
        $caption = Module::get_image_caption( $id, $caption_type );
        
        if ( $caption == '' ) {
			return '';
		}
        
        ob_start();
        ?>
        <div class="pp-gallery-image-caption">
            <?php echo $caption; ?>
        </div>
        <?php
        $html = ob_get_contents();
		ob_end_clean();
        return $html;
    }
    
    protected function render_link_icon() {
        $settings = $this->get_settings_for_display();
        
        if ( $settings['link_icon'] == '' ) {
			return '';
		}
        
        ob_start();
        ?>
        <div class="pp-gallery-image-icon-wrap">
            <span class="pp-gallery-image-icon <?php echo $settings['link_icon']; ?>">
            </span>
        </div>
        <?php
        $html = ob_get_contents();
		ob_end_clean();
        return $html;
    }
    
    protected function render_image_overlay() {
        $this->add_render_attribute( 'overlay', 'class', [
            'pp-image-overlay',
            'pp-gallery-image-overlay',
		] );
		
        return '<div ' . $this->get_render_attribute_string( 'overlay' ) . '></div>';
	}

	/**
	 * Returns Video Thumbnail.
	 *
	 * @access protected
	 */
	protected function get_video_thumbnail( $item, $thumb_size ) {
        
        $thumb_url  = '';
        $video_id   = $this->get_video_id( $item );
        
        if ( $item['custom_thumbnail'] == 'yes' ) {
            
            if ( $item['custom_image']['url'] ) {
                $thumb_url = $item['custom_image']['url'];
            }
            
        } elseif ( $item['video_source'] == 'youtube' ) {

            if ( $video_id != '' ) {
                $thumb_url = 'https://i.ytimg.com/vi/' . $video_id . '/' . $thumb_size . '.jpg';
            }

        } elseif ( $item['video_source'] == 'vimeo' ) {

            if ( $video_id != '' ) {
                $vimeo = unserialize( file_get_contents( "https://vimeo.com/api/v2/video/$video_id.php" ) );
                $thumb_url = $vimeo[0]['thumbnail_large'];
            }
            
        } elseif ( $item['video_source'] == 'dailymotion' ) {

            if ( $video_id != '' ) {
                $dailymotion = 'https://api.dailymotion.com/video/'.$video_id.'?fields=thumbnail_url';
                $get_thumbnail = json_decode( file_get_contents( $dailymotion ), TRUE );
                $thumb_url = $get_thumbnail['thumbnail_url'];
            }
        }
        
        return $thumb_url;

    }

	/**
	 * Returns Video ID.
	 *
	 * @access protected
	 */
	protected function get_video_id( $item ) {

		$video_id = '';

		if ( $item['video_source'] == 'youtube' ) {
            $url = $item['youtube_url'];
            
			if ( preg_match( "#(?<=v=|v\/|vi=|vi\/|youtu.be\/)[a-zA-Z0-9_-]{11}#", $url, $matches ) ) {
				$video_id = $matches[0];
			}

		} elseif ( $item['video_source'] == 'vimeo' ) {
            $url = $item['vimeo_url'];

			$video_id = preg_replace( '/[^\/]+[^0-9]|(\/)/', '', rtrim( $url, '/' ) );

		} elseif ( $item['video_source'] == 'dailymotion' ) {
            $url = $item['dailymotion_url'];
            
            if ( preg_match('/^.+dailymotion.com\/(?:video|swf\/video|embed\/video|hub|swf)\/([^&?]+)/', $url, $matches) ) {
				$video_id = $matches[1];
			}

		}

		return $video_id;

	}

	/**
	 * Get embed params.
	 *
	 * Retrieve video widget embed parameters.
	 *
	 * @access public
	 *
	 * @return array Video embed parameters.
	 */
	public function get_embed_params( $item ) {
		$settings = $this->get_settings_for_display();

		$params = [];

		$params_dictionary = [];

		if ( 'youtube' === $item['video_source'] ) {
            
            $params_dictionary = [
				'mute',
			];

			$params['autoplay'] = 1;

			$params['wmode'] = 'opaque';
		} elseif ( 'vimeo' === $item['video_source'] ) {
            
            $params_dictionary = [
				'mute' => 'muted',
			];

            $params['autopause'] = '0';
			$params['autoplay'] = '1';
		} elseif ( 'dailymotion' === $item['video_source'] ) {
            
            $params_dictionary = [
				'mute',
			];
            
			$params['endscreen-enable'] = '0';
			$params['autoplay'] = 1;

		}

		foreach ( $params_dictionary as $key => $param_name ) {
			$setting_name = $param_name;

			if ( is_string( $key ) ) {
				$setting_name = $key;
			}

			$setting_value = $settings[ $setting_name ] ? '1' : '0';

			$params[ $param_name ] = $setting_value;
		}

		return $params;
	}
    
    /**
	 * Render play icon output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
    protected function render_play_icon() {
        $settings = $this->get_settings_for_display();
        
        if ( $settings['play_icon_type'] == 'none' ) {
            return;
        }

        $this->add_render_attribute( 'play-icon', 'class', 'pp-video-play-icon' );
        
        if ( $settings['play_icon_type'] == 'icon' ) {
            
            if ( $settings['play_icon'] != '' ) {
                $this->add_render_attribute( 'play-icon', 'class', $settings['play_icon'] );
            } else {
                $this->add_render_attribute( 'play-icon', 'class', 'fa fa-play-circle' );
            }
            ?>
            <span <?php $this->print_render_attribute_string( 'play-icon' ); ?>></span>
            <?php

        } elseif ( $settings['play_icon_type'] == 'image' ) {
            
            if ( $settings['play_icon_image']['url'] != '' ) {
                ?>
                <span <?php $this->print_render_attribute_string( 'play-icon' ); ?>>
                    <img src="<?php echo esc_url( $settings['play_icon_image']['url'] ); ?>">
                </span>
                <?php
            }

        }
    }

	/**
	 *  Get Saved Widgets
	 *
	 *  @param string $type Type.
	 *  
	 *  @return string
	 */
	public function get_page_template_options( $type = '' ) {

		$page_templates = pp_get_page_templates( $type );

		$options[-1]   = esc_html__( 'Select', 'powerpack' );

		if ( count( $page_templates ) ) {
			foreach ( $page_templates as $id => $name ) {
				$options[ $id ] = $name;
			}
		} else {
			$options['no_template'] = esc_html__( 'No saved templates found!', 'powerpack' );
		}

		return $options;
	}
}